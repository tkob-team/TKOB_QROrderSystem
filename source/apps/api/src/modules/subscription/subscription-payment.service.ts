import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PaymentService } from '../payment/services/payment.service';
import { SubscriptionService } from './subscription.service';
import { 
  CreateSubscriptionPaymentDto, 
  SubscriptionPaymentResponseDto,
  SubscriptionPaymentStatusDto,
} from './dto/subscription-payment.dto';
import { SubscriptionTier, PaymentStatus, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Bank code to bank name mapping for SePay QR
const BANK_CODE_MAP: Record<string, string> = {
  'VCB': 'Vietcombank',
  'TCB': 'Techcombank',
  'MB': 'MBBank',
  'ACB': 'ACB',
  'BIDV': 'BIDV',
  'VTB': 'VietinBank',
  'TPB': 'TPBank',
  'VPB': 'VPBank',
  'SHB': 'SHB',
  'MSB': 'MSB',
  'CTG': 'VietinBank', // CTG is VietinBank code
};

/**
 * SubscriptionPaymentService
 * 
 * Handles payment flow for subscription upgrades using platform SePay config.
 * 
 * Flow:
 * 1. Tenant initiates upgrade
 * 2. Create payment intent using platform SePay (not tenant's SePay)
 * 3. Show QR code to tenant
 * 4. Webhook or polling confirms payment
 * 5. Upgrade tenant subscription
 */
@Injectable()
export class SubscriptionPaymentService {
  private readonly logger = new Logger(SubscriptionPaymentService.name);
  private readonly PAYMENT_EXPIRY_MINUTES = 15;
  private readonly PENDING_UPGRADE_PREFIX = 'subscription:upgrade:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Create subscription payment intent for upgrade
   * 
   * @param tenantId - Tenant initiating upgrade
   * @param dto - Upgrade request data
   * @returns Payment intent with QR code
   */
  async createUpgradePayment(
    tenantId: string,
    dto: CreateSubscriptionPaymentDto,
  ): Promise<SubscriptionPaymentResponseDto> {
    this.logger.log(`Creating subscription upgrade payment for tenant ${tenantId} to ${dto.targetTier}`);

    // 1. Get target plan
    const plans = await this.subscriptionService.getPlans();
    const targetPlan = plans.find(p => p.tier === dto.targetTier);

    if (!targetPlan) {
      throw new NotFoundException(`Plan ${dto.targetTier} not found`);
    }

    // 2. Get current subscription
    const currentSub = await this.subscriptionService.getTenantSubscription(tenantId);
    
    if (!currentSub) {
      throw new BadRequestException('No current subscription found. Please contact support.');
    }

    // 3. Validate upgrade (can't upgrade to same or lower tier)
    if (targetPlan.priceUSD <= currentSub.plan.priceUSD) {
      throw new BadRequestException(
        `Cannot upgrade from ${currentSub.plan.tier} to ${dto.targetTier}. Target plan must have higher price.`,
      );
    }

    // 4. Check for existing pending upgrade (now includes targetTier to prevent cache collision)
    const existingUpgradeKey = `${this.PENDING_UPGRADE_PREFIX}${tenantId}:${dto.targetTier}`;
    const existingUpgrade = await this.redis.get(existingUpgradeKey);
    
    if (existingUpgrade) {
      const parsed = JSON.parse(existingUpgrade);
      // Check if the existing payment is still valid
      if (new Date(parsed.expiresAt) > new Date()) {
        this.logger.warn(`Tenant ${tenantId} already has pending upgrade payment for ${dto.targetTier}: ${parsed.paymentId}`);
        
        // Regenerate QR URL with correct format (in case cached data has old format)
        const bankName = BANK_CODE_MAP[parsed.bankCode] || parsed.bankCode;
        parsed.qrCodeUrl = `https://qr.sepay.vn/img?acc=${parsed.accountNumber}&bank=${encodeURIComponent(bankName)}&amount=${parsed.amountVND}&des=${encodeURIComponent(parsed.transferContent)}&template=compact`;
        
        // Return the existing payment info with updated QR URL
        return parsed;
      }
    }

    // 5. Calculate amount (use VND for payment)
    const amountVND = targetPlan.priceVND;
    const amountUSD = targetPlan.priceUSD;

    if (amountVND <= 0) {
      throw new BadRequestException('Target plan has no price configured');
    }

    // 6. Generate unique upgrade request ID
    const upgradeRequestId = this.generateUpgradeRequestId(tenantId);

    // 7. Create payment intent using platform SePay
    const sepayProvider = this.paymentService.getSepayProvider();
    const paymentIntent = await sepayProvider.createPlatformPaymentIntent(
      upgradeRequestId,
      amountVND,
      `Subscription upgrade to ${targetPlan.name}`,
    );

    // 8. Store in database - Create a special "subscription payment" record
    const expiresAt = new Date(Date.now() + this.PAYMENT_EXPIRY_MINUTES * 60 * 1000);

    const payment = await this.prisma.payment.create({
      data: {
        // orderId: null for subscription payments (not related to any order)
        tenantId,
        method: PaymentMethod.SEPAY_QR,
        status: PaymentStatus.PENDING,
        amount: new Decimal(amountVND),
        currency: 'VND',
        bankCode: paymentIntent.bankCode,
        accountNumber: paymentIntent.accountNumber,
        qrContent: paymentIntent.qrContent,
        deepLink: paymentIntent.deepLink,
        transferContent: paymentIntent.transferContent,
        providerData: {
          type: 'subscription_upgrade',
          targetTier: dto.targetTier,
          targetPlanId: targetPlan.id,
          currentTier: currentSub.plan.tier,
          amountUSD,
          amountVND,
          upgradeRequestId,
        },
        expiresAt,
      },
    });

    // 9. Generate SePay QR URL
    // Format: https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK_NAME&amount=AMOUNT&des=CONTENT
    const bankName = BANK_CODE_MAP[paymentIntent.bankCode] || paymentIntent.bankCode;
    const qrCodeUrl = `https://qr.sepay.vn/img?acc=${paymentIntent.accountNumber}&bank=${encodeURIComponent(bankName)}&amount=${amountVND}&des=${encodeURIComponent(paymentIntent.transferContent)}&template=compact`;

    // 10. Cache upgrade request in Redis (for quick lookup by transfer content)
    const upgradeData: SubscriptionPaymentResponseDto = {
      paymentId: payment.id,
      upgradeRequestId,
      targetPlan: targetPlan.name,
      targetTier: dto.targetTier,
      amountUSD,
      amountVND,
      qrContent: paymentIntent.qrContent,
      qrCodeUrl,
      deepLink: paymentIntent.deepLink,
      transferContent: paymentIntent.transferContent,
      accountNumber: paymentIntent.accountNumber,
      accountName: paymentIntent.accountName,
      bankCode: paymentIntent.bankCode,
      status: PaymentStatus.PENDING,
      expiresAt,
      createdAt: payment.createdAt,
    };

    await this.redis.set(
      existingUpgradeKey,
      JSON.stringify(upgradeData),
      this.PAYMENT_EXPIRY_MINUTES * 60,
    );

    // Also store by transfer content for webhook matching
    await this.redis.set(
      `subscription:transfer:${paymentIntent.transferContent}`,
      JSON.stringify({ tenantId, paymentId: payment.id, targetTier: dto.targetTier }),
      this.PAYMENT_EXPIRY_MINUTES * 60,
    );

    this.logger.log(
      `Subscription upgrade payment created: ${payment.id} for tenant ${tenantId} - Amount: ${amountVND} VND`,
    );

    return upgradeData;
  }

  /**
   * Check subscription payment status and upgrade if paid
   * 
   * @param tenantId - Tenant ID
   * @param paymentId - Payment ID to check
   * @returns Payment status and upgrade result
   */
  async checkUpgradePaymentStatus(
    tenantId: string,
    paymentId: string,
  ): Promise<SubscriptionPaymentStatusDto> {
    this.logger.log(`Checking subscription payment status: ${paymentId}`);

    // 1. Get payment from database
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        tenantId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const providerData = payment.providerData as any;
    
    // Verify this is a subscription payment
    if (providerData?.type !== 'subscription_upgrade') {
      throw new BadRequestException('This is not a subscription payment');
    }

    // 2. If already completed, return success
    if (payment.status === PaymentStatus.COMPLETED) {
      const currentSub = await this.subscriptionService.getTenantSubscription(tenantId);
      return {
        paymentId: payment.id,
        status: PaymentStatus.COMPLETED,
        subscriptionUpgraded: true,
        currentTier: currentSub?.plan.tier,
        transactionId: payment.transactionId || undefined,
        paidAt: payment.paidAt || undefined,
      };
    }

    // 3. If expired, return failed
    if (payment.expiresAt < new Date()) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, failureReason: 'Payment expired' },
      });

      return {
        paymentId: payment.id,
        status: PaymentStatus.FAILED,
        subscriptionUpgraded: false,
        errorMessage: 'Payment expired. Please create a new upgrade request.',
      };
    }

    // 4. Poll SePay to check if payment was made
    const checkResult = await this.paymentService.checkPaymentViaPoll(paymentId);

    if (checkResult.completed) {
      // Payment was found via polling - upgrade subscription
      await this.processSuccessfulUpgrade(tenantId, payment, checkResult.transaction);

      return {
        paymentId: payment.id,
        status: PaymentStatus.COMPLETED,
        subscriptionUpgraded: true,
        currentTier: providerData.targetTier,
        transactionId: checkResult.transaction?.id,
        paidAt: checkResult.transaction?.transactionTime,
      };
    }

    // 5. Payment still pending
    return {
      paymentId: payment.id,
      status: payment.status,
      subscriptionUpgraded: false,
    };
  }

  /**
   * Process successful subscription upgrade (called by webhook or polling)
   */
  async processSuccessfulUpgrade(
    tenantId: string,
    payment: any,
    transaction?: any,
  ): Promise<void> {
    const providerData = payment.providerData as any;
    const targetTier = providerData?.targetTier as SubscriptionTier;

    if (!targetTier) {
      this.logger.error(`No target tier found in payment ${payment.id}`);
      return;
    }

    this.logger.log(`Processing subscription upgrade for tenant ${tenantId} to ${targetTier}`);

    try {
      // Upgrade subscription
      await this.subscriptionService.upgradePlan(tenantId, targetTier, payment.id);

      // Update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: transaction?.id,
          paidAt: transaction?.transactionTime || new Date(),
        },
      });

      // Clear Redis cache
      await this.redis.del(`${this.PENDING_UPGRADE_PREFIX}${tenantId}`);
      if (payment.transferContent) {
        await this.redis.del(`subscription:transfer:${payment.transferContent}`);
      }

      this.logger.log(`Tenant ${tenantId} successfully upgraded to ${targetTier}`);
    } catch (error) {
      this.logger.error(`Failed to process subscription upgrade: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle subscription payment webhook
   * 
   * Called when SePay webhook is received for a subscription payment.
   */
  async handleSubscriptionWebhook(
    transferContent: string,
    transactionId: string,
    amount: number,
  ): Promise<{ success: boolean; upgraded: boolean }> {
    this.logger.log(`Handling subscription webhook - Content: ${transferContent}`);

    // Find pending upgrade by transfer content
    const cached = await this.redis.get(`subscription:transfer:${transferContent}`);
    
    if (!cached) {
      this.logger.debug(`No pending subscription upgrade found for: ${transferContent}`);
      return { success: false, upgraded: false };
    }

    const { tenantId, paymentId, targetTier } = JSON.parse(cached);

    // Get payment
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.status === PaymentStatus.COMPLETED) {
      return { success: true, upgraded: false };
    }

    // Validate amount
    if (Math.abs(amount - payment.amount.toNumber()) > 1) {
      this.logger.warn(`Amount mismatch for subscription payment ${paymentId}`);
      return { success: false, upgraded: false };
    }

    // Process upgrade
    await this.processSuccessfulUpgrade(tenantId, payment, {
      id: transactionId,
      transactionTime: new Date(),
    });

    return { success: true, upgraded: true };
  }

  /**
   * Generate unique upgrade request ID
   */
  private generateUpgradeRequestId(tenantId: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const tenantPart = tenantId.substring(0, 4).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `UPG-${tenantPart}-${timestamp}-${random}`;
  }
}
