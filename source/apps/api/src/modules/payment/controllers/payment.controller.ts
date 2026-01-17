import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CurrencyService } from '../services/currency.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { PaymentIntentResponseDto } from '../dto/payment-intent-response.dto';
import { PaymentWebhookDto } from '../dto/payment-webhook.dto';
import { PaymentStatusResponseDto } from '../dto/payment-status-response.dto';
import { 
  PollTransactionsDto, 
  PollTransactionsResponseDto,
  CheckPaymentResponseDto,
} from '../dto/poll-transactions.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { SessionGuard } from '@/modules/table/guards/session.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Session } from '@/common/decorators/session.decorator';
import { SessionData } from '@/modules/table/services/table-session.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly currencyService: CurrencyService,
  ) {}

  @Get('exchange-rate')
  @Public()
  @ApiOperation({ summary: 'Get current USD to VND exchange rate' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate retrieved',
    schema: {
      type: 'object',
      properties: {
        from: { type: 'string', example: 'USD' },
        to: { type: 'string', example: 'VND' },
        rate: { type: 'number', example: 25000 },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getExchangeRate() {
    return this.currencyService.getExchangeRate('USD', 'VND');
  }

  @Post('intent')
  @UseGuards(SessionGuard)
  @Public()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({ summary: 'Create payment intent for order' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid order or order already paid' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createPaymentIntent(
    @Session() session: SessionData,
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    return this.paymentService.createPaymentIntent(session.tenantId, dto);
  }

  @Get(':paymentId')
  @Public()
  @ApiOperation({ summary: 'Get payment status' })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved',
    type: PaymentStatusResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentStatus(
    @Param('paymentId') paymentId: string,
  ): Promise<PaymentStatusResponseDto> {
    return this.paymentService.getPaymentStatus(paymentId);
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SePay webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid signature or payload' })
  @ApiResponse({ status: 401, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Body() webhookDto: PaymentWebhookDto,
    @Headers('authorization') authorization: string,
  ): Promise<{ success: boolean; message?: string }> {
    // SePay sends signature in Authorization header: "Apikey YOUR_API_KEY"
    const signature = authorization || '';
    return this.paymentService.handleWebhook(webhookDto, signature);
  }

  @Get('poll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Poll SePay for recent transactions',
    description: 'Fallback mechanism when webhook not available. Polls SePay API for recent transactions.',
  })
  @ApiQuery({ name: 'transferContent', required: false, description: 'Specific transfer content to search for' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transactions to fetch (default 20)' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved', type: PollTransactionsResponseDto })
  async pollTransactions(
    @Query() query: PollTransactionsDto,
  ): Promise<PollTransactionsResponseDto> {
    return this.paymentService.pollTransactions(query.transferContent, query.limit);
  }

  @Get(':paymentId/check')
  @Public()
  @ApiOperation({ 
    summary: 'Check payment status via SePay polling',
    description: 'Checks if a pending payment has been paid by polling SePay API. Use this when webhook is not available.',
  })
  @ApiResponse({ status: 200, description: 'Payment check result', type: CheckPaymentResponseDto })
  async checkPaymentViaPoll(
    @Param('paymentId') paymentId: string,
  ): Promise<CheckPaymentResponseDto> {
    return this.paymentService.checkPaymentViaPoll(paymentId);
  }
}
