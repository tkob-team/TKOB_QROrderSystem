import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto } from '../dto/menu-category.dto';
import { MenuCategoryRepository } from '../repositories/menu-category.repository';
import { Prisma } from '@prisma/client';
import { ErrorCode, ErrorMessages } from 'src/common/constants/error-codes.constant';
import { MenuCategoryResponseDto } from '../dto/menu-response.dto';

@Injectable()
export class MenuCategoryService {
  constructor(private readonly categoryRepo: MenuCategoryRepository) {}

  // this.menuCategoryService.create(user.tenantId, dto)
  async create(tenantId: string, dto: CreateMenuCategoryDto): Promise<MenuCategoryResponseDto> {
    try {
      const category = await this.categoryRepo.create({
        tenantId,
        name: dto.name,
        description: dto.description,
        displayOrder: dto.displayOrder ?? 0,
        active: dto.active ?? true,
      });

      return {
        ...category,
        description: category.description ?? undefined,
        itemCount: 0,
      };
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

  async findAll(tenantId: string, activeOnly?: boolean): Promise<MenuCategoryResponseDto[]> {
    const categories = await this.categoryRepo.findAllWithItemCount(tenantId, activeOnly);

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description ?? undefined,
      displayOrder: category.displayOrder,
      active: category.active,
      itemCount: category._count.menuItems,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  /**
   * Find category by ID with item count - OPTIMIZED with single query
   */
  async findById(id: string): Promise<MenuCategoryResponseDto> {
    const category = await this.categoryRepo.findByIdWithItemCount(id);

    if (!category) {
      throw new NotFoundException(ErrorMessages[ErrorCode.MENU_CATEGORY_NOT_FOUND]);
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description ?? undefined,
      displayOrder: category.displayOrder,
      active: category.active,
      itemCount: category._count.menuItems,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Update category - refetch with count after update
   */
  async update(categoryId: string, dto: UpdateMenuCategoryDto): Promise<MenuCategoryResponseDto> {
    // Verify category exists
    await this.findById(categoryId);

    // Update category
    await this.categoryRepo.update(categoryId, dto);

    // Refetch with item count
    return this.findById(categoryId);
  }

  async delete(categoryId: string): Promise<void> {
    // Verify category exists
    await this.findById(categoryId);

    // Check if category has menu items
    const hasItems = await this.categoryRepo.hasMenuItems(categoryId);

    if (hasItems) {
      throw new ConflictException(
        'Cannot archive category that contains menu items. Please move or delete all items first.',
      );
    }

    // Soft delete: set active = false
    await this.categoryRepo.update(categoryId, { active: false });
  }
}
