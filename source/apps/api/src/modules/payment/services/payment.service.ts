import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { RedisService } from '@/modules/redis/redis.service';
import { OrderGateway } from '@/modules/websocket/gateways/order.gateway';
import { PaymentConfigService } from '@/modules/payment-config/payment-config.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { PaymentIntentResponseDto } from '../dto/payment-intent-response.dto';
import { PaymentStatusResponseDto } from '../dto/payment-status-response.dto';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';
import { 
  CheckPaymentResponseDto, 
  PollTransactionsResponseDto,
  SepayTransactionDto,
} from '../dto/poll-transactions.dto';
import { SepayProvider, SepayTransaction } from '../providers/sepay.provider';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  PaymentExpiredException,
  InvalidPaymentAmountException,
  OrderAlreadyHasPaymentException,
} from '../exceptions/payment.exceptions';

// Exchange rate: 1 USD = 25,000 VND
const USD_TO_VND_RATE = 25000;

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
  'CTG': 'VietinBank',
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paymentExpiryMinutes: number;
  private readonly CACHE_TTL = 300; // 5 minutes in seconds
  private readonly CACHE_PREFIX = 'payment:status:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly sepayProvider: SepayProvider,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
    private readonly orderGateway: OrderGateway,
    private readonly paymentConfigService: PaymentConfigService,
  ) {
    this.paymentExpiryMinutes =
      this.configService.get<number>('payment.paymentExpiryMinutes') || 15;
  }

  /**
   * Create payment intent for an order
   *
   * Flow:
   * 1. Validate order exists and belongs to tenant
   * 2. Check order doesn't already have a pending/paid payment
   * 3. Calculate amount from order total
   * 4. Call SePay provider to generate payment intent
   * 5. Create Payment record in database
   * 6. Return payment details to frontend
   *
   * @param tenantId - Tenant identifier
   * @param dto - Payment intent creation data
   * @returns Payment intent response with QR code and payment details
   * @throws NotFoundException if order not found
   * @throws BadRequestException if order already has active payment
   */
  async createPaymentIntent(
    tenantId: string,
    dto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    this.logger.log(
      `[${tenantId}] Creating payment intent for order ${dto.orderId}`,
    );

    // Use transaction to ensure atomicity
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate order exists and belongs to tenant
      const order = await tx.order.findFirst({
        where: {
          id: dto.orderId,
          tenantId,
        },
        select: {
          id: true,
          orderNumber: true,
          tenantId: true,
          total: true,
          paymentMethod: true,
          paymentStatus: true,
          status: true,
        },
      });

      if (!order) {
        this.logger.warn(
          `[${tenantId}] Order ${dto.orderId} not found or unauthorized`,
        );
        throw new NotFoundException(
          `Order ${dto.orderId} not found or you don't have permission to access it`,
        );
      }

      this.logger.debug(
        `[${tenantId}] Order ${order.orderNumber} found - Total: ${order.total} VND`,
      );

      // 2. Check if order already has an active payment
      const existingPayment = await tx.payment.findFirst({
        where: {
          orderId: order.id,
          status: {
            in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.COMPLETED],
          },
        },
      });

      if (existingPayment) {
        this.logger.warn(
          `[${tenantId}] Order ${order.orderNumber} already has ${existingPayment.status} payment: ${existingPayment.id} - Returning existing payment (idempotent)`,
        );
        
        // Idempotent behavior: Return existing payment instead of error
        return {
          paymentId: existingPayment.id,
          orderId: existingPayment.orderId,
          amount: existingPayment.amount.toNumber(),
          currency: existingPayment.currency,
          qrContent: existingPayment.qrContent || '',
          qrCodeUrl: this.generateSepayQrUrl(
            existingPayment.accountNumber || '',
            this.getBankName(existingPayment.bankCode || ''),
            existingPayment.amount.toNumber(),
            existingPayment.transferContent || '',
          ),
          deepLink: existingPayment.deepLink ?? undefined,
          transferContent: existingPayment.transferContent || '',
          accountNumber: existingPayment.accountNumber || '',
          bankCode: existingPayment.bankCode || '',
          status: existingPayment.status,
          expiresAt: existingPayment.expiresAt,
          createdAt: existingPayment.createdAt,
        };
      }

      // 3. Calculate amount - convert USD to VND for SePay
      const amountUSD = order.total.toNumber();
      const amountVND = Math.round(amountUSD * USD_TO_VND_RATE);

      if (amountUSD <= 0) {
        throw new BadRequestException(
          `Invalid order amount: ${amountUSD}. Amount must be greater than 0.`,
        );
      }

      this.logger.debug(
        `[${tenantId}] Order ${order.orderNumber} - USD: $${amountUSD} -> VND: ${amountVND}`,
      );

      // 4. Get tenant's SePay config for customer payments
      const tenantConfig = await this.paymentConfigService.getInternalConfig(tenantId);
      
      if (!tenantConfig || !tenantConfig.sepayEnabled) {
        throw new BadRequestException(
          `Tenant ${tenantId} has not configured SePay payment. Please configure payment settings first.`,
        );
      }

      if (!tenantConfig.sepayAccountNo || !tenantConfig.sepayBankCode) {
        throw new BadRequestException(
          `Tenant ${tenantId} SePay config incomplete. Missing account number or bank code.`,
        );
      }

      // 5. Generate payment intent from SePay provider using tenant's bank account
      this.logger.debug(
        `[${tenantId}] Calling SePay provider with tenant config - Bank: ${tenantConfig.sepayBankCode} - Amount: ${amountVND} VND`,
      );

      const paymentIntent = await this.sepayProvider.createPaymentIntent(
        order.id,
        amountVND, // Pass VND amount to SePay
        'VND',
        {
          orderNumber: order.orderNumber,
          tenantId,
          returnUrl: dto.returnUrl,
          cancelUrl: dto.cancelUrl,
        },
        {
          // Pass tenant's bank config so QR directs payment to tenant's account
          accountNumber: tenantConfig.sepayAccountNo,
          accountName: tenantConfig.sepayAccountName || undefined,
          bankCode: tenantConfig.sepayBankCode,
          apiKey: tenantConfig.sepayApiKey || undefined,
        },
      );

      // 6. Create Payment record
      const expiresAt = new Date(Date.now() + this.paymentExpiryMinutes * 60 * 1000);

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          tenantId,
          method: PaymentMethod.SEPAY_QR,
          status: PaymentStatus.PENDING,
          amount: new Decimal(amountVND), // Store VND amount
          currency: 'VND',
          bankCode: paymentIntent.bankCode,
          accountNumber: paymentIntent.accountNumber,
          qrContent: paymentIntent.qrContent,
          deepLink: paymentIntent.deepLink,
          transferContent: paymentIntent.transferContent,
          providerData: {
            ...paymentIntent.providerData,
            amountUSD,
            amountVND,
          },
          expiresAt,
        },
      });

      // 7. Generate SePay QR URL for frontend display
      const bankName = BANK_CODE_MAP[paymentIntent.bankCode] || paymentIntent.bankCode;
      const qrCodeUrl = `https://qr.sepay.vn/img?acc=${paymentIntent.accountNumber}&bank=${encodeURIComponent(bankName)}&amount=${amountVND}&des=${encodeURIComponent(paymentIntent.transferContent)}&template=compact`;

      this.logger.log(
        `[${tenantId}] Payment created: ${payment.id} for order ${order.orderNumber} - Amount: ${amountVND} VND (${amountUSD} USD) - Expires: ${expiresAt.toISOString()}`,
      );

      // 8. Return response DTO
      return {
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: payment.amount.toNumber(),
        currency: payment.currency,
        qrContent: payment.qrContent!,
        qrCodeUrl, // SePay QR image URL
        deepLink: payment.deepLink ?? undefined,
        transferContent: payment.transferContent!,
        accountNumber: payment.accountNumber!,
        bankCode: payment.bankCode!,
        status: payment.status,
        expiresAt: payment.expiresAt,
        createdAt: payment.createdAt,
      };
    });
  }

  /**
   * Get payment status by ID with Redis caching
   *
   * Flow:
   * 1. Check Redis cache first
   * 2. If cache miss, query database
   * 3. Transform to DTO
   * 4. Cache result for 5 minutes
   * 5. Return payment status with order details
   *
   * @param paymentId - Payment identifier
   * @returns Payment status with order information
   * @throws NotFoundException if payment not found
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto> {
    this.logger.log(`Getting payment status for ${paymentId}`);

    // 1. Try to get from cache
    const cacheKey = `${this.CACHE_PREFIX}${paymentId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for payment ${paymentId}`);
      return JSON.parse(cached);
    }

    this.logger.debug(`Cache miss for payment ${paymentId}, querying database`);

    // 2. Query database
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            status: true,
            orderNumber: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment ${paymentId} not found`);
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    // 3. Transform to DTO
    const response: PaymentStatusResponseDto = {
      paymentId: payment.id,
      orderId: payment.orderId || '',
      method: payment.method,
      status: payment.status,
      amount: payment.amount.toNumber(),
      currency: payment.currency,
      transactionId: payment.transactionId || undefined,
      paidAt: payment.paidAt || undefined,
      failureReason: payment.failureReason || undefined,
      orderStatus: payment.order?.status || 'PENDING',
      expiresAt: payment.expiresAt,
      createdAt: payment.createdAt,
    };

    // 4. Cache the result for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(response), this.CACHE_TTL);
    this.logger.debug(`Cached payment status for ${paymentId} (TTL: ${this.CACHE_TTL}s)`);

    return response;
  }

  /**
   * Handle webhook from SePay
   *
   * Flow:
   * 1. Verify webhook signature
   * 2. Extract and validate webhook data
   * 3. Find payment by transfer content
   * 4. Check idempotency (transaction ID)
   * 5. Update payment status and record transaction details
   * 6. Update order status and payment status
   * 7. Create order status history entry
   * 8. Emit WebSocket event (placeholder for EPIC 5)
   * 9. Return success response
   *
   * @param webhookData - Webhook payload from SePay
   * @param signature - Authorization header signature
   * @returns void (SePay expects HTTP 200 with {success: true})
   * @throws UnauthorizedException if signature invalid
   * @throws NotFoundException if payment not found
   * @throws BadRequestException if data invalid
   */
  async handleWebhook(
    webhookData: PaymentWebhookDto,
    signature: string,
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log(
      `[Webhook] Received webhook - TransactionID: ${webhookData.transactionId}, Content: ${webhookData.transferContent}, Amount: ${webhookData.amount}, Status: ${webhookData.status}`,
    );

    // 1. Verify signature
    const isValidSignature = this.sepayProvider.verifyWebhookSignature(
      webhookData,
      signature,
    );

    if (!isValidSignature) {
      this.logger.error(
        `[Webhook] Invalid signature for transaction ${webhookData.transactionId}`,
      );
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.logger.debug(
      `[Webhook] Signature verified for transaction ${webhookData.transactionId}`,
    );

    // 2. Validate webhook data
    if (!webhookData.transferContent || !webhookData.transactionId) {
      this.logger.error(
        `[Webhook] Missing required fields - TransactionID: ${webhookData.transactionId}, Content: ${webhookData.transferContent}`,
      );
      throw new BadRequestException(
        'Missing required webhook fields: transferContent or transactionId',
      );
    }

    // Use transaction for atomicity
    return await this.prisma.$transaction(async (tx) => {
      // 3. Find payment by transfer content
      const payment = await tx.payment.findFirst({
        where: {
          transferContent: webhookData.transferContent,
          status: {
            in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
          },
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              tenantId: true,
              status: true,
              paymentStatus: true,
            },
          },
        },
      });

      if (!payment) {
        this.logger.warn(
          `[Webhook] Payment not found or already processed - Content: ${webhookData.transferContent}`,
        );
        // Return success to prevent SePay retry (idempotency)
        return {
          success: true,
          message: 'Payment not found or already processed',
        };
      }

      this.logger.debug(
        `[Webhook] Payment found: ${payment.id}${payment.order ? ` for order ${payment.order.orderNumber}` : ' (subscription payment)'}`,
      );

      // 4. Check idempotency - has this transaction been processed?
      if (payment.transactionId === webhookData.transactionId) {
        this.logger.warn(
          `[Webhook] Duplicate webhook - Transaction ${webhookData.transactionId} already processed for payment ${payment.id}`,
        );
        return {
          success: true,
          message: 'Transaction already processed (idempotent)',
        };
      }

      // 5. Determine payment status from webhook
      const isSuccess = webhookData.status === 'success';
      const newPaymentStatus = isSuccess
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;

      // Validate amount matches
      const expectedAmount = payment.amount.toNumber();
      if (Math.abs(webhookData.amount - expectedAmount) > 0.01) {
        this.logger.error(
          `[Webhook] Amount mismatch - Expected: ${expectedAmount}, Received: ${webhookData.amount} for payment ${payment.id}`,
        );
        throw new InvalidPaymentAmountException(expectedAmount, webhookData.amount);
      }

      // 6. Update payment record
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
          transactionId: webhookData.transactionId,
          paidAt: isSuccess ? new Date(webhookData.transactionTime) : null,
          failureReason: isSuccess ? null : 'Payment failed from provider',
          providerData: {
            ...(payment.providerData as any),
            webhook: {
              transactionId: webhookData.transactionId,
              bankCode: webhookData.bankCode,
              accountNumber: webhookData.accountNumber,
              transactionTime: webhookData.transactionTime,
              status: webhookData.status,
              metadata: webhookData.metadata,
              processedAt: new Date().toISOString(),
            },
          },
        },
      });

      this.logger.log(
        `[Webhook] Payment ${payment.id} updated to ${newPaymentStatus} - Transaction: ${webhookData.transactionId}`,
      );

      // Invalidate cache after webhook update
      const cacheKey = `${this.CACHE_PREFIX}${payment.id}`;
      await this.redis.del(cacheKey);
      this.logger.debug(`Invalidated cache for payment ${payment.id}`);

      // 7. Update order status if payment successful (skip for subscription payments)
      let updatedOrder;
      if (isSuccess && payment.order) {
        // Update order payment status and potentially order status
        const newOrderStatus =
          payment.order.status === OrderStatus.PENDING
            ? OrderStatus.RECEIVED
            : payment.order.status;

        updatedOrder = await tx.order.update({
          where: { id: payment.order.id },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            paidAt: new Date(webhookData.transactionTime),
            status: newOrderStatus,
          },
        });

        // 8. Create order status history
        if (newOrderStatus !== payment.order.status) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: payment.order.id,
              status: newOrderStatus,
              notes: `Order status auto-updated after payment completed. Transaction: ${webhookData.transactionId}`,
            },
          });

          this.logger.log(
            `[Webhook] Order ${payment.order.orderNumber} status updated: ${payment.order.status} → ${newOrderStatus}`,
          );
        }

        this.logger.log(
          `[Webhook] Order ${payment.order.orderNumber} payment completed - Amount: ${webhookData.amount} VND`,
        );
      } else if (!isSuccess && payment.order) {
        // Payment failed - update order payment status
        updatedOrder = await tx.order.update({
          where: { id: payment.order.id },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        });

        this.logger.warn(
          `[Webhook] Order ${payment.order.orderNumber} payment failed - Transaction: ${webhookData.transactionId}`,
        );
      }

      // 9. Emit WebSocket event for payment completion (only for order payments)
      if (payment.order) {
        this.orderGateway.emitPaymentCompleted(payment.order.tenantId, payment.order.id, {
          id: payment.id,
          status: newPaymentStatus,
          amount: payment.amount.toNumber(),
          transactionId: webhookData.transactionId,
          paidAt: isSuccess ? new Date(webhookData.transactionTime) : null,
          orderNumber: payment.order.orderNumber,
          orderStatus: updatedOrder.status,
        });
        this.logger.debug(
          `Emitted order:payment_completed event for order ${payment.order.id}`,
        );
      }

      this.logger.log(
        `[Webhook] Successfully processed webhook for payment ${payment.id} - Status: ${newPaymentStatus}`,
      );

      return {
        success: true,
        message: `Payment ${isSuccess ? 'completed' : 'failed'} successfully`,
      };
    });
  }

  /**
   * Poll SePay for recent transactions and check if any match pending payments
   * 
   * This is a fallback mechanism when webhook is not available (e.g., local development).
   * Frontend can call this endpoint every few seconds to check for payment completion.
   * 
   * @param transferContent - Optional: specific transfer content to search for
   * @param limit - Number of recent transactions to fetch
   * @returns Poll result with transactions and match status
   */
  async pollTransactions(
    transferContent?: string,
    limit: number = 20,
  ): Promise<PollTransactionsResponseDto> {
    this.logger.log(`Polling SePay transactions (content: ${transferContent || 'all'}, limit: ${limit})`);

    try {
      const transactions = await this.sepayProvider.pollTransactions(limit);

      const response: PollTransactionsResponseDto = {
        success: true,
        transactions: transactions.map(this.mapSepayTransaction),
        polledAt: new Date(),
      };

      // If specific transfer content provided, check for match
      if (transferContent) {
        const matched = transactions.find((tx) =>
          tx.transferContent.toUpperCase().includes(transferContent.toUpperCase()),
        );

        if (matched) {
          response.matchedTransaction = this.mapSepayTransaction(matched);
          
          // Try to process this payment automatically
          const processed = await this.processPolledTransaction(matched);
          response.paymentProcessed = processed;
        }
      }

      return response;
    } catch (error) {
      this.logger.error(`Failed to poll transactions: ${error.message}`);
      return {
        success: false,
        transactions: [],
        polledAt: new Date(),
      };
    }
  }

  /**
   * Check and process a specific payment by ID using SePay polling
   * 
   * This checks if a pending payment has been paid by polling SePay API.
   * If payment is found, it updates the payment and order status.
   * 
   * @param paymentId - Payment ID to check
   * @returns Check result with payment status
   */
  async checkPaymentViaPoll(paymentId: string): Promise<CheckPaymentResponseDto> {
    this.logger.log(`Checking payment via poll: ${paymentId}`);

    // Get payment from database
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            tenantId: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      return {
        found: false,
        completed: false,
        message: 'Payment not found',
      };
    }

    // If already completed, check if subscription upgrade is needed
    if (payment.status === PaymentStatus.COMPLETED) {
      // Check if this is a subscription payment that hasn't been processed yet
      const providerData = payment.providerData as any;
      if (providerData?.type === 'subscription_upgrade' && providerData?.targetPlanId) {
        // Check if subscription is already upgraded
        const currentSub = await this.prisma.tenantSubscription.findUnique({
          where: { tenantId: payment.tenantId },
          select: { planId: true },
        });

        // If subscription not yet upgraded, upgrade it now
        if (currentSub && currentSub.planId !== providerData.targetPlanId) {
          this.logger.log(
            `Payment ${paymentId} completed but subscription not upgraded yet. Upgrading now...`,
          );

          try {
            await this.prisma.tenantSubscription.update({
              where: { tenantId: payment.tenantId },
              data: {
                planId: providerData.targetPlanId,
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                lastPaymentId: payment.id,
              },
            });

            this.logger.log(
              `✅ Subscription upgraded for tenant ${payment.tenantId} to ${providerData.targetTier}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to upgrade subscription for tenant ${payment.tenantId}:`,
              error,
            );
          }
        }
      }

      return {
        found: true,
        status: payment.status,
        completed: true,
        message: 'Payment already completed',
      };
    }

    // If expired, return error
    if (payment.expiresAt < new Date()) {
      return {
        found: true,
        status: PaymentStatus.FAILED,
        completed: false,
        message: 'Payment expired',
      };
    }

    // Poll SePay for matching transaction
    const transferContent = payment.transferContent;
    if (!transferContent) {
      return {
        found: true,
        status: payment.status,
        completed: false,
        message: 'Payment has no transfer content',
      };
    }

    try {
      const matchedTx = await this.sepayProvider.findTransactionByContent(
        transferContent,
        50, // Search last 50 transactions
      );

      if (!matchedTx) {
        return {
          found: true,
          status: payment.status,
          completed: false,
          message: 'Payment not yet received. Please complete the bank transfer.',
        };
      }

      // Validate amount
      const expectedAmount = payment.amount.toNumber();
      if (Math.abs(matchedTx.amount - expectedAmount) > 1) {
        this.logger.warn(
          `Amount mismatch for payment ${paymentId}: expected ${expectedAmount}, got ${matchedTx.amount}`,
        );
        return {
          found: true,
          status: payment.status,
          completed: false,
          transaction: this.mapSepayTransaction(matchedTx),
          message: `Amount mismatch: expected ${expectedAmount} VND, received ${matchedTx.amount} VND`,
        };
      }

      // Process the payment
      await this.processMatchedPayment(payment, matchedTx);

      return {
        found: true,
        status: PaymentStatus.COMPLETED,
        completed: true,
        transaction: this.mapSepayTransaction(matchedTx),
        message: 'Payment completed successfully!',
      };
    } catch (error) {
      this.logger.error(`Failed to check payment via poll: ${error.message}`);
      return {
        found: true,
        status: payment.status,
        completed: false,
        message: `Error checking payment: ${error.message}`,
      };
    }
  }

  /**
   * Process a matched transaction from polling
   */
  private async processPolledTransaction(tx: SepayTransaction): Promise<boolean> {
    try {
      // Find payment by transfer content
      const payment = await this.prisma.payment.findFirst({
        where: {
          transferContent: {
            contains: tx.transferContent,
            mode: 'insensitive',
          },
          status: PaymentStatus.PENDING,
        },
        include: {
          order: true,
        },
      });

      if (!payment) {
        this.logger.debug(`No pending payment found for transaction: ${tx.transferContent}`);
        return false;
      }

      await this.processMatchedPayment(payment, tx);
      return true;
    } catch (error) {
      this.logger.error(`Failed to process polled transaction: ${error.message}`);
      return false;
    }
  }

  /**
   * Process a matched payment (update status, order, emit events)
   */
  private async processMatchedPayment(
    payment: any,
    tx: SepayTransaction,
  ): Promise<void> {
    this.logger.log(`Processing matched payment: ${payment.id} - Transaction: ${tx.id}`);

    await this.prisma.$transaction(async (prisma) => {
      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: tx.id,
          paidAt: tx.transactionTime,
          providerData: {
            ...(payment.providerData as any),
            polledTransaction: {
              id: tx.id,
              amount: tx.amount,
              bankCode: tx.bankCode,
              senderName: tx.senderName,
              transactionTime: tx.transactionTime,
              processedAt: new Date().toISOString(),
              method: 'polling',
            },
          },
        },
      });

      // Update order (if this is an order payment, not subscription payment)
      if (payment.orderId && payment.order) {
        const newOrderStatus =
          payment.order.status === OrderStatus.PENDING
            ? OrderStatus.RECEIVED
            : payment.order.status;

        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            paidAt: tx.transactionTime,
            status: newOrderStatus,
          },
        });

        // Create status history if status changed
        if (newOrderStatus !== payment.order.status) {
          await prisma.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              status: newOrderStatus,
              notes: `Order status auto-updated after payment confirmed via polling. Transaction: ${tx.id}`,
            },
          });
        }
      } else {
        // This is a subscription payment (no order)
        this.logger.log(`Subscription payment completed: ${payment.id} - Processing subscription upgrade`);
        
        // Extract target tier from providerData
        const providerData = payment.providerData as any;
        if (providerData?.type === 'subscription_upgrade' && providerData?.targetTier) {
          try {
            // Update subscription plan
            await prisma.tenantSubscription.update({
              where: { tenantId: payment.tenantId },
              data: {
                planId: providerData.targetPlanId,
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                lastPaymentId: payment.id,
              },
            });
            
            this.logger.log(
              `✅ Subscription upgraded for tenant ${payment.tenantId} to ${providerData.targetTier}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to upgrade subscription for tenant ${payment.tenantId}:`,
              error,
            );
          }
        }
      }
    });

    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}${payment.id}`);

    // Emit WebSocket event (only for order payments)
    if (payment.order) {
      this.orderGateway.emitPaymentCompleted(payment.order.tenantId, payment.orderId!, {
        id: payment.id,
        status: PaymentStatus.COMPLETED,
        amount: payment.amount.toNumber(),
        transactionId: tx.id,
        paidAt: tx.transactionTime,
        orderNumber: payment.order.orderNumber,
        method: 'polling',
      });
    }

    this.logger.log(`Payment ${payment.id} completed via polling - Transaction: ${tx.id}`);
  }

  /**
   * Map SePay transaction to DTO
   */
  private mapSepayTransaction(tx: SepayTransaction): SepayTransactionDto {
    return {
      id: tx.id,
      amount: tx.amount,
      accountNumber: tx.accountNumber,
      transferContent: tx.transferContent,
      transactionTime: tx.transactionTime,
      bankCode: tx.bankCode,
      senderAccountNumber: tx.senderAccountNumber,
      senderName: tx.senderName,
    };
  }

  /**
   * Get SePay provider instance (for subscription payments)
   */
  getSepayProvider(): SepayProvider {
    return this.sepayProvider;
  }

  /**
   * Get bank name from code
   */
  private getBankName(bankCode: string): string {
    return BANK_CODE_MAP[bankCode] || bankCode;
  }

  /**
   * Generate SePay QR URL
   */
  private generateSepayQrUrl(
    accountNumber: string,
    bankName: string,
    amount: number,
    transferContent: string,
  ): string {
    return `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${encodeURIComponent(bankName)}&amount=${amount}&des=${encodeURIComponent(transferContent)}&template=compact`;
  }
}
