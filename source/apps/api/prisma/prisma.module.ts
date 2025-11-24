import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global() decorator makes this module global-scoped.
 * Once imported into the AppModule, PrismaService will be available 
 * everywhere without needing to import PrismaModule in feature modules.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Expose service for other modules to use
})
export class PrismaModule {}