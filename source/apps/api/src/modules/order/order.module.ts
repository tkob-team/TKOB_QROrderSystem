import { Module } from '@nestjs/common';
import { MenuModule } from '../menu/menu.module';
import { CartController } from './controllers/cart.controller';
import { CartService } from './services/cart.service';
import { TableModule } from '../table/table.module';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { OrderGateway } from './gateways/order.gateway';
import { KdsController } from './controllers/kds.controller';

@Module({
  imports: [MenuModule, TableModule],
  controllers: [CartController, OrderController, KdsController],
  providers: [
    // Services
    CartService,
    OrderService,

    // WebSocket Gateway
    OrderGateway,
  ],
  exports: [CartService, OrderService, OrderGateway],
})
export class OrderModule {}
