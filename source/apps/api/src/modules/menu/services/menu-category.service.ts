import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMenuCategoryDto } from '../dto/menu-category.dto';
import { MenuCategoryRepository } from '../repositories/menu-category.repository';
import { Prisma } from '@prisma/client';

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
}
