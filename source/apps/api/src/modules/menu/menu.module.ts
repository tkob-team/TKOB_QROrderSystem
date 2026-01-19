import { Module } from '@nestjs/common';
import { MenuCategoryController } from './controllers/menu-category.controller';
import { MenuCategoryService } from './services/menu-category.service';
import { MenuCategoryRepository } from './repositories/menu-category.repository';
import { MenuItemsService } from './services/menu-item.service';
import { MenuItemsRepository } from './repositories/menu-item.repository';
import { MenuItemsController } from './controllers/menu-item.controller';
import { ModifierGroupController } from './controllers/modifier-group.controller';
import { ModifierGroupService } from './services/modifier-group.service';
import { ModifierGroupRepository } from './repositories/modifier-group.repository';
import { PublicMenuController } from './controllers/public-menu.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MenuPhotoController } from './controllers/menu-photo.controller';
import { MenuPhotoService } from './services/menu-photo.service';
import { MenuCacheService } from './services/menu-cache.service';
import { StorageModule } from './infrastructure/storage/storage.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { MenuItemsPublicController } from './controllers/menu-item-public.controller';
import { TableModule } from '../table/table.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    // Configure Multer for file uploads
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
      },
    }),

    StorageModule,
    SubscriptionModule,
    forwardRef(() => TableModule), // Prevent circular dependency
  ],
  controllers: [
    MenuCategoryController,
    MenuItemsController,
    MenuItemsPublicController,
    ModifierGroupController,
    PublicMenuController,
    MenuPhotoController,
  ],
  providers: [
    // Services
    MenuCategoryService,
    MenuItemsService,
    ModifierGroupService,
    MenuPhotoService,
    MenuCacheService,

    // Repository
    MenuCategoryRepository,
    MenuItemsRepository,
    ModifierGroupRepository,
  ],
  exports: [
    // Export services for use in other modules (e.g., Orders, Table modules)
    MenuItemsService,
    MenuPhotoService,
  ],
})
export class MenuModule {}
