import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentConfigService } from './payment-config.service';
import {
  UpdatePaymentConfigDto,
  PaymentConfigResponseDto,
  TestPaymentConfigDto,
  TestPaymentResultDto,
} from './dto/payment-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetTenant } from '../../common/decorators/tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payment Config')
@Controller('admin/payment-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER) // Only owner can manage payment config
@ApiBearerAuth()
export class PaymentConfigController {
  constructor(private readonly paymentConfigService: PaymentConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get payment configuration for tenant' })
  @ApiResponse({ status: 200, type: PaymentConfigResponseDto })
  async getConfig(
    @GetTenant() tenantId: string,
  ): Promise<PaymentConfigResponseDto> {
    return this.paymentConfigService.getConfig(tenantId);
  }

  @Put()
  @ApiOperation({ summary: 'Update payment configuration' })
  @ApiResponse({ status: 200, type: PaymentConfigResponseDto })
  async updateConfig(
    @GetTenant() tenantId: string,
    @Body() dto: UpdatePaymentConfigDto,
  ): Promise<PaymentConfigResponseDto> {
    return this.paymentConfigService.updateConfig(tenantId, dto);
  }

  @Post('test')
  @ApiOperation({
    summary: 'Test payment config by generating a sample QR code',
  })
  @ApiResponse({ status: 200, type: TestPaymentResultDto })
  async testConfig(
    @GetTenant() tenantId: string,
    @Body() dto: TestPaymentConfigDto,
  ): Promise<TestPaymentResultDto> {
    return this.paymentConfigService.testConfig(tenantId, dto.amount);
  }

  @Get('banks')
  @ApiOperation({ summary: 'Get list of supported banks' })
  async getSupportedBanks() {
    return this.paymentConfigService.getSupportedBanks();
  }

  @Get('status')
  @ApiOperation({ summary: 'Check if tenant has valid payment config' })
  async getStatus(@GetTenant() tenantId: string) {
    const hasValid = await this.paymentConfigService.hasValidConfig(tenantId);
    return {
      configured: hasValid,
      message: hasValid
        ? 'Payment is ready to accept'
        : 'Please configure payment settings',
    };
  }

  @Get('public/payment-methods')
  @Public()
  @ApiOperation({ 
    summary: 'Get available payment methods for customer app',
    description: 'Public endpoint to check which payment methods are enabled for a tenant'
  })
  @ApiQuery({ name: 'tenantId', required: true, type: String })
  @ApiResponse({ 
    status: 200, 
    schema: {
      properties: {
        methods: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['BILL_TO_TABLE', 'SEPAY_QR']
        },
        sepayEnabled: { type: 'boolean' }
      }
    }
  })
  async getPublicPaymentMethods(@Query('tenantId') tenantId: string) {
    const config = await this.paymentConfigService.getConfig(tenantId);
    const methods = ['BILL_TO_TABLE']; // Cash payment always enabled
    
    if (config.sepayEnabled && config.sepayAccountNo && config.sepayBankCode) {
      methods.push('SEPAY_QR');
    }

    return {
      methods,
      sepayEnabled: config.sepayEnabled,
    };
  }
}
