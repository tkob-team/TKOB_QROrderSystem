import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto } from '../dto/menu-category.dto';
import { MenuCategoryRepository } from '../repositories/menu-category.repository';
import { Prisma } from '@prisma/client';
import { ErrorCode, ErrorMessages } from 'src/common/constants/error-codes.constant';

@Injectable()
export class MenuCategoryService {
  constructor(private readonly categoryRepo: MenuCategoryRepository) {}

  // this.menuCategoryService.create(user.tenantId, dto)
  async create(tenantId: string, dto: CreateMenuCategoryDto) {
    try {
      return this.categoryRepo.create({
        tenantId,
        name: dto.name,
        description: dto.description,
        displayOrder: dto.displayOrder ?? 0,
        active: dto.active ?? true,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Check which fields caused the unique constraint violation
        const target = error.meta?.target as string[] | undefined;

        // Only handle if it's the (tenant_id, name) constraint
        if (target && target.includes('tenant_id') && target.includes('name')) {
          throw new ConflictException(
            `Category with name "${dto.name}" already exists in your restaurant`,
          );
        }
      }
      // Re-throw other errors to be handled by filters
      throw error;
    }
  }

  async findAll(tenantId: string, activeOnly?: boolean) {
    if (activeOnly) {
      return this.categoryRepo.findAllActive(tenantId);
    }

    return this.categoryRepo.findAll({
      where: { tenantId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  // return this.menuCategoryService.findById(id);
  async findById(id: string) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new NotFoundException(ErrorMessages[ErrorCode.MENU_CATEGORY_NOT_FOUND]);
    }

    return category;
  }

  async update(categoryId: string, dto: UpdateMenuCategoryDto) {
    await this.findById(categoryId);

    return this.categoryRepo.update(categoryId, dto);
  }

  async delete(categoryId: string): Promise<void> {
    // Verify category exists
    await this.findById(categoryId);

    // Check if category has menu items
    const hasItems = await this.categoryRepo.hasMenuItems(categoryId);

    if (hasItems) {
      throw new ConflictException(
        'Cannot delete category that contains menu items. Please move or delete all items first.',
      );
    }

    // Delete category
    await this.categoryRepo.delete(categoryId);
  }
}
