import { Injectable } from '@nestjs/common';
import { MenuCategory, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from 'src/database/repositories/base.repository';

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
}
