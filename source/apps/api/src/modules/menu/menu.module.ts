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
import { StorageModule } from './infrastructure/storage/storage.module';

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
  ],
  controllers: [
    MenuCategoryController,
    MenuItemsController,
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
