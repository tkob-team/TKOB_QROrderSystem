import { Module, forwardRef } from '@nestjs/common';
import { TableController } from './controllers/table.controller';
import { PublicTableController } from './controllers/public-table.controller';
import { TableService } from './services/table.service';
import { TableSessionService } from './services/table-session.service';
import { QrService } from './services/qr.service';
import { PdfService } from './services/pdf.service';
import { TableRepository } from './repositories/table.repository';
import { TableSessionRepository } from './repositories/table-session.repository';
import { SessionGuard } from './guards/session.guard';
import { MenuModule } from '../menu/menu.module';
import { OrderModule } from '../order/order.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    forwardRef(() => MenuModule), 
    forwardRef(() => OrderModule),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [TableController, PublicTableController],
  providers: [
    // Services
    TableService,
    TableSessionService,
    QrService,
    PdfService,

    // Repositories
    TableRepository,
    TableSessionRepository,

    // Guards
    SessionGuard,
  ],
  exports: [
    // Export for use in other modules (e.g., Order module)
    TableService,
    TableSessionService,
    QrService,
    SessionGuard, // Export guard for MenuModule
  ],
})
export class TableModule {}
