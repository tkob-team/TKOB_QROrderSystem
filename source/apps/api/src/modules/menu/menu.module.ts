import { Module } from '@nestjs/common';
import { MenuCategoryController } from './controllers/menu-category.controller';
import { MenuCategoryService } from './services/menu-category.service';
import { MenuCategoryRepository } from './repositories/menu-category.repository';

@Module({
  controllers: [MenuCategoryController],
  providers: [
    // Services
    MenuCategoryService,

    // Repository
    MenuCategoryRepository,
  ],
  exports: [
    // Export services for use in other modules (e.g., Orders module)
  ],
})
export class MenuModule {}
