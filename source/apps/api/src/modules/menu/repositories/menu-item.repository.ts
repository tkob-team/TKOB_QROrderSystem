import { Injectable } from '@nestjs/common';
import { MenuItem, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from 'src/database/repositories/base.repository';
import { MenuItemFiltersDto } from '../dto/menu-item.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export interface MenuItemWithRelations extends MenuItem {
  category?: any;
  modifierGroups?: any[];
  photo?: any[];
}

@Injectable()
export class MenuItemsRepository extends BaseRepository<MenuItem, Prisma.MenuItemDelegate> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.menuItem);
  }

  async findByIdWithDetails(itemId: string): Promise<MenuItemWithRelations | null> {
    return this.prisma.x.menuItem.findUnique({
      where: { id: itemId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            displayOrder: true,
            active: true,
          },
        },
        photos: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        modifierGroups: {
          include: {
            modifierGroup: {
              include: {
                options: {
                  where: { active: true },
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async attachModifierGroups(itemId: string, modifierGroupIds: string[]) {
    // Delete existing relations
    await this.prisma.menuItemModifier.deleteMany({
      where: { menuItemId: itemId },
    });

    // Create new relations
    await this.prisma.menuItemModifier.createMany({
      data: modifierGroupIds.map((groupId, index) => ({
        menuItemId: itemId,
        modifierGroupId: groupId,
        displayOrder: index,
      })),
    });
  }

  async findFiltered(tenantId: string, filters: MenuItemFiltersDto) {
    let orderBy:
      | Prisma.MenuItemOrderByWithRelationInput
      | Prisma.MenuItemOrderByWithRelationInput[]
      | undefined;

    if (filters.sortBy) {
      const sortOrder = filters.sortOrder || 'asc';

      switch (filters.sortBy) {
        case 'popularity':
          orderBy = { popularity: sortOrder };
          break;
        case 'price':
          orderBy = { price: sortOrder };
          break;
        case 'name':
          orderBy = { name: sortOrder };
          break;
        case 'createdAt':
          orderBy = { createdAt: sortOrder };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    } else {
      orderBy = { createdAt: 'desc' };
    }

    return this.findPaginated(new PaginationDto(filters.page, filters.limit), {
      where: {
        tenantId,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.available !== undefined && { available: filters.available }),
        ...(filters.chefRecommended !== undefined && { chefRecommended: filters.chefRecommended }), // NEW
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        category: true,
        photos: {
          // NEW: Include primary photo
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy,
    });
  }

  async softDelete(menuItemId: string) {
    return this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        status: 'ARCHIVED',
      },
    });
  }

  async findPublishedMenu(tenantId: string): Promise<MenuItemWithRelations[]> {
    return this.prisma.x.menuItem.findMany({
      where: {
        tenantId,
        status: 'PUBLISHED',
        available: true,
        category: {
          active: true,
        },
      },
      include: {
        category: true,
        photos: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        modifierGroups: {
          include: {
            modifierGroup: {
              include: {
                options: {
                  where: { active: true },
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: [
        { category: { displayOrder: 'asc' } },
        { chefRecommended: 'desc' },
        { displayOrder: 'asc' },
      ],
    });
  }

  async publish(itemId: string) {
    return this.prisma.x.menuItem.update({
      where: { id: itemId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Unpublish menu item
   */
  async unpublish(itemId: string) {
    return this.prisma.x.menuItem.update({
      where: { id: itemId },
      data: {
        status: 'DRAFT',
      },
    });
  }

  /**
   * Toggle availability
   */
  async toggleAvailability(itemId: string, available: boolean) {
    return this.prisma.x.menuItem.update({
      where: { id: itemId },
      data: { available },
    });
  }

  async incrementPopularity(itemId: string): Promise<void> {
    await this.prisma.menuItem.update({
      where: { id: itemId },
      data: {
        popularity: {
          increment: 1,
        },
      },
    });
  }
}
