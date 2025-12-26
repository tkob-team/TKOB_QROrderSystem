import { Injectable } from '@nestjs/common';
import { MenuCategory, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from 'src/database/repositories/base.repository';

export type MenuCategoryWithCount = MenuCategory & {
  _count: {
    menuItems: number;
  };
};

@Injectable()
export class MenuCategoryRepository extends BaseRepository<
  MenuCategory,
  Prisma.MenuCategoryDelegate
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.menuCategory);
  }

  async findAllActive(tenantId: string): Promise<MenuCategory[]> {
    return this.findAll({
      where: {
        tenantId,
        active: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  /**
   * Check if category has any menu items
   */
  async hasMenuItems(categoryId: string): Promise<boolean> {
    const count = await this.prisma.menuItem.count({
      where: { categoryId },
    });

    return count > 0;
  }

  async countMenuItems(categoryId: string): Promise<number> {
    return this.prisma.menuItem.count({
      where: {
        categoryId,
        // status:
      },
    });
  }

  /**
   * Find all categories with item count in single query
   */
  async findAllWithItemCount(
    tenantId: string,
    activeOnly?: boolean,
  ): Promise<MenuCategoryWithCount[]> {
    return this.prisma.menuCategory.findMany({
      where: {
        tenantId,
        ...(activeOnly ? { active: true } : {}),
      },
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async findByIdWithItemCount(
    categoryId: string,
    tenantId?: string,
  ): Promise<MenuCategoryWithCount | null> {
    return this.prisma.menuCategory.findUnique({
      where: {
        tenantId,
        id: categoryId,
      },
      include: {
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
    });
  }
}
