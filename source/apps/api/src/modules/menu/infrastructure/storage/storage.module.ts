// apps/api/src/modules/menu/infrastructure/storage/storage.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { EnvConfig } from '@config/env.validation';
import { STORAGE_SERVICE } from './storage.interface';
import { LocalStorageService } from './local.storage';
import { S3StorageService } from './s3.storage';

/**
 * Storage Module
 *
 * Configures storage implementation via environment variable
 *
 * Usage in .env:
 * - STORAGE_DRIVER=local  → Use LocalStorageService
 * - STORAGE_DRIVER=s3     → Use S3StorageService
 *
 * Default: local (development)
 */
@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageService,
    S3StorageService,
    {
      provide: STORAGE_SERVICE,
      useFactory: (
        config: ConfigService<EnvConfig, true>,
        localStorage: LocalStorageService,
        s3Storage: S3StorageService,
      ) => {
        const driver = process.env.STORAGE_DRIVER || 'local';

        switch (driver) {
          case 's3':
            return s3Storage;
          case 'local':
          default:
            return localStorage;
        }
      },
      inject: [ConfigService, LocalStorageService, S3StorageService],
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
