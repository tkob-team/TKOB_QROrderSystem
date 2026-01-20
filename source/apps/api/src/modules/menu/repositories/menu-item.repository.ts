import { Injectable } from '@nestjs/common';
import { MenuItem, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from 'src/database/repositories/base.repository';
import { MenuItemFiltersDto } from '../dto/menu-item.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MenuSortByEnum, SortOrderEnum } from '../dto/menu-publish.dto';
import {
  fuzzySearch,
  FuzzySearchPresets,
  shouldUseFuzzySearch,
} from 'src/common/utils/fuzzy-search.util';

export interface MenuItemWithRelations extends MenuItem {
  category?: any;
  modifierGroups?: any[];
  photos?: any[];
}

export interface PublicMenuFilters {
  search?: string;
  categoryId?: string;
  chefRecommended?: boolean;
  sortBy?: MenuSortByEnum;
  sortOrder?: SortOrderEnum;
  page?: number;
  limit?: number;
}

@Injectable()
export class MenuItemsRepository extends BaseRepository<MenuItem, Prisma.MenuItemDelegate> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.menuItem);
  }

  async findByIdWithDetails(itemId: string): Promise<MenuItemWithRelations | null> {
    const item = await this.prisma.x.menuItem.findUnique({
      where: { id: itemId },
      include: {
        category: true,
        photos: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        modifierGroups: {
          where: {
            modifierGroup: {
              active: true,
            },
          },
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

    if (!item) return null;

    // Convert Prisma Decimal to number for priceDelta
    return {
      ...item,
      price: Number(item.price),
      modifierGroups: item.modifierGroups?.map((mg) => ({
        ...mg,
        modifierGroup: {
          ...mg.modifierGroup,
          options: mg.modifierGroup.options.map((opt) => ({
            ...opt,
            priceDelta: Number(opt.priceDelta),
          })),
        },
      })),
    } as any;
  }

  /**
   * Find menu item by ID for public/customer endpoints
   * Uses explicit tenantId instead of auto-filter from context
   * This is needed when logged-in customer (with their own tenant) views another restaurant's menu
   */
  async findByIdWithDetailsForTenant(itemId: string, tenantId: string): Promise<MenuItemWithRelations | null> {
    // Use base prisma client (not extended) with explicit tenantId filter
    const item = await this.prisma.menuItem.findFirst({
      where: { 
        id: itemId,
        tenantId: tenantId,
      },
      include: {
        category: true,
        photos: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        modifierGroups: {
          where: {
            modifierGroup: {
              active: true,
            },
          },
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

    if (!item) return null;

    // Convert Prisma Decimal to number
    return {
      ...item,
      price: Number(item.price),
      modifierGroups: item.modifierGroups?.map((mg) => ({
        ...mg,
        modifierGroup: {
          ...mg.modifierGroup,
          options: mg.modifierGroup.options.map((opt) => ({
            ...opt,
            priceDelta: Number(opt.priceDelta),
          })),
        },
      })),
    } as any;
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

    // Map display sortBy strings to actual field names
    let sortByField = filters.sortBy;
    if (sortByField) {
      const sortByMap: Record<string, string> = {
        'Sort by: Newest': 'createdAt',
        'Sort by: Oldest': 'createdAt',
        'Price (Low)': 'price',
        'Price (High)': 'price',
        'Name (A-Z)': 'name',
        'Name (Z-A)': 'name',
        Popularity: 'popularity',
      };
      sortByField = sortByMap[sortByField] || sortByField;
    }

    if (sortByField && ['popularity', 'price', 'name', 'createdAt'].includes(sortByField)) {
      const sortOrder = filters.sortOrder || 'asc';
      orderBy = { [sortByField]: sortOrder };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // Handle pageSize alias for limit - prioritize pageSize over limit
    const limit = filters.pageSize ?? filters.limit ?? 20;
    console.log('[MenuItemRepository] Pagination:', {
      pageSize: filters.pageSize,
      limit: filters.limit,
      finalLimit: limit,
      page: filters.page,
    });

    // Handle availability filter
    let availabilityFilter: boolean | undefined = filters.available;
    if (filters.availability) {
      if (filters.availability === 'available') {
        availabilityFilter = true;
      } else if (filters.availability === 'unavailable') {
        availabilityFilter = false;
      }
      // 'all' or any other value = undefined (no filter)
    }

    // Transform status to uppercase for enum matching
    let statusFilter: any = filters.status;
    if (statusFilter) {
      // Convert "Draft" -> "DRAFT", "Published" -> "PUBLISHED", etc.
      statusFilter = statusFilter.toUpperCase();
      // Validate it's a valid enum value
      if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(statusFilter)) {
        statusFilter = undefined;
      }
    }

    const result = await this.findPaginated(new PaginationDto(filters.page, limit), {
      where: {
        tenantId,
        ...(filters.categoryId &&
          filters.categoryId !== 'all' && { categoryId: filters.categoryId }),
        ...(statusFilter && { status: statusFilter }),
        ...(availabilityFilter !== undefined && { available: availabilityFilter }),
        ...(filters.chefRecommended !== undefined && { chefRecommended: filters.chefRecommended }),
        // Remove search from Prisma query - will apply fuzzy search post-query
      },
      include: {
        category: true,
        photos: {
          // NEW: Include primary photo
          where: { isPrimary: true },
          take: 1,
        },
        modifierGroups: {
          where: {
            modifierGroup: {
              active: true,
            },
          },
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
      orderBy,
    });

    // Transform Decimal to number for all items
    let items = result.data.map((item: any) => ({
      ...item,
      price: Number(item.price),
      modifierGroups: item.modifierGroups?.map((mg: any) => ({
        ...mg,
        modifierGroup: {
          ...mg.modifierGroup,
          options: mg.modifierGroup.options.map((opt: any) => ({
            ...opt,
            priceDelta: Number(opt.priceDelta),
          })),
        },
      })),
    }));

    // Apply fuzzy search if search query is provided
    if (filters.search && shouldUseFuzzySearch(filters.search)) {
      items = fuzzySearch(items, filters.search, FuzzySearchPresets.MENU_ITEMS);
    }

    return {
      ...result,
      data: items,
      total: items.length, // Update total after fuzzy search filtering
    } as any;
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

  async findPublishedMenuPaginated(
    tenantId: string,
    filters: PublicMenuFilters,
  ): Promise<{
    data: MenuItemWithRelations[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const {
      search,
      categoryId,
      chefRecommended,
      sortBy = MenuSortByEnum.DISPLAY_ORDER,
      sortOrder = SortOrderEnum.ASC,
      page = 1,
      limit = 20,
    } = filters;

    // Build where clause
    const where: Prisma.MenuItemWhereInput = {
      tenantId,
      status: 'PUBLISHED',
      // available: true,
      category: {
        active: true,
      },
      ...(categoryId && { categoryId }),
      ...(chefRecommended !== undefined && { chefRecommended }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { array_contains: [search] } },
        ],
      }),
    };

    // Build orderBy clause
    let orderBy:
      | Prisma.MenuItemOrderByWithRelationInput
      | Prisma.MenuItemOrderByWithRelationInput[];

    switch (sortBy) {
      case MenuSortByEnum.POPULARITY:
        orderBy = [{ popularity: sortOrder }, { displayOrder: 'asc' }];
        break;
      case MenuSortByEnum.PRICE:
        orderBy = [{ price: sortOrder }, { displayOrder: 'asc' }];
        break;
      case MenuSortByEnum.NAME:
        orderBy = [{ name: sortOrder }, { displayOrder: 'asc' }];
        break;
      case MenuSortByEnum.DISPLAY_ORDER:
      default:
        orderBy = [
          { category: { displayOrder: 'asc' } },
          { chefRecommended: 'desc' },
          { displayOrder: sortOrder },
        ];
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [items, total] = await Promise.all([
      this.prisma.x.menuItem.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              displayOrder: true,
            },
          },
          photos: {
            orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
          },
          modifierGroups: {
            where: {
              modifierGroup: {
                active: true,
              },
            },
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
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
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
