import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './services/payment.service';
import { CurrencyService } from './services/currency.service';
import { PaymentController } from './controllers/payment.controller';
import { SepayProvider } from './providers/sepay.provider';
import { RedisModule } from '../redis/redis.module';
import { PaymentConfigModule } from '../payment-config/payment-config.module';
import { TableModule } from '../table/table.module';
import paymentConfig from '@/config/payment.config';

@Module({
  imports: [
    ConfigModule.forFeature(paymentConfig),
    RedisModule,
    PaymentConfigModule,
    TableModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, SepayProvider, CurrencyService],
  exports: [PaymentService, CurrencyService],
})
export class PaymentModule {}
