import { Module, forwardRef } from '@nestjs/common';
import { MenuModule } from '../menu/menu.module';
import { TenantModule } from '../tenant/tenant.module';
import { CartController } from './controllers/cart.controller';
import { CartService } from './services/cart.service';
import { TableModule } from '../table/table.module';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { KdsController } from './controllers/kds.controller';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PaymentConfigModule } from '../payment-config/payment-config.module';

@Module({
  imports: [
    forwardRef(() => MenuModule),
    TableModule,
    TenantModule,
    forwardRef(() => SubscriptionModule),
    PaymentConfigModule,
  ],
  controllers: [CartController, OrderController, KdsController],
  providers: [
    // Services
    CartService,
    OrderService,
  ],
  exports: [CartService, OrderService],
})
export class OrderModule {}
