import { Module } from '@nestjs/common';
import { TableController } from './controllers/table.controller';
import { TableService } from './services/table.service';
import { QrService } from './services/qr.service';
import { TableRepository } from './repositories/table.repository';

@Module({
  controllers: [TableController],
  providers: [
    // Services
    TableService,
    QrService,

    // Repositories
    TableRepository,
  ],
  exports: [
    // Export for use in other modules (e.g., Order module)
    TableService,
    QrService,
  ],
})
export class TableModule {}
