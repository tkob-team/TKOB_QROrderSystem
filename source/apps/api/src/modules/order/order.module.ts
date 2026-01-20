import { Module, forwardRef } from '@nestjs/common';
import { MenuModule } from '../menu/menu.module';
import { TenantModule } from '../tenant/tenant.module';
import { AuthModule } from '../auth/auth.module';
import { CartController } from './controllers/cart.controller';
import { CartService } from './services/cart.service';
import { TableModule } from '../table/table.module';
import { OrderService } from './services/order.service';
import { BillService } from './services/bill.service';
import { BillPdfService } from './services/bill-pdf.service';
import { OrderController } from './controllers/order.controller';
import { KdsController } from './controllers/kds.controller';
import { BillController } from './controllers/bill.controller';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PaymentConfigModule } from '../payment-config/payment-config.module';

@Module({
  imports: [
    forwardRef(() => MenuModule),
    forwardRef(() => TableModule),
    TenantModule,
    AuthModule,
    forwardRef(() => SubscriptionModule),
    PaymentConfigModule,
  ],
  controllers: [CartController, OrderController, KdsController, BillController],
  providers: [
    // Services
    CartService,
    OrderService,
    BillService,
    BillPdfService,
  ],
  exports: [CartService, OrderService, BillService, BillPdfService],
})
export class OrderModule {}
