import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type {
  CreateMenuItemDto,
  MenuItemFiltersDto,
  UpdateMenuItemDto,
} from '../dto/menu-item.dto';
import { MenuCategoryRepository } from '../repositories/menu-category.repository';
import { MenuItemsRepository } from '../repositories/menu-item.repository';
import { ErrorCode, ErrorMessages } from 'src/common/constants/error-codes.constant';
import { ModifierGroupRepository } from '../repositories/modifier-group.repository';
import { MenuSortByEnum, PublicMenuFiltersDto, SortOrderEnum } from '../dto/menu-publish.dto';
import { MenuCacheService } from './menu-cache.service';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class MenuItemsService {
  private readonly logger = new Logger(MenuItemsService.name);

  constructor(
    private readonly menuItemRepo: MenuItemsRepository,
    private readonly menuCategoryRepo: MenuCategoryRepository,
    private readonly modifierGroupRepo: ModifierGroupRepository,
    private readonly menuCache: MenuCacheService,
    private readonly prisma: PrismaService,
  ) {}

  async create(tenantId: string, dto: CreateMenuItemDto) {
    /* create menu item for tenant:
      INSERT INTO MenuItems (name, ..., categoryId, ..., modifierGroupIds)
      VALUES (...)
      Vấn đề:
        1. Khoá ngoại đến category (id)
          {
            1. FE Tự lôi hết cate và map vào với id => khi chọn cate:name -> tự động map vào và chèn vào id
            2. BE quan tâm?
              - Name phải là unique
              - categoryId đó nó có thực sự tồn tại không? => cateRepo.findById().hasValue?
                  + If yep -> gắn vào
                  + If no -> báo lỗi
          }
        2. Chưa có modifier => thêm sau khi xây dựng xong
    */
    // Kiểm tra xem tên đã tồn tại chưa? => đã cài unique trong database rồi
    // Kiểm tra category có tồn tại không?
    const category = await this.menuCategoryRepo.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException(ErrorMessages[ErrorCode.MENU_CATEGORY_NOT_FOUND]);
    }

    // Verify modifier groups exist (if provided)
    if (dto.modifierGroupIds && dto.modifierGroupIds.length > 0) {
      // Filter out null/undefined values to prevent Prisma errors
      const validGroupIds = dto.modifierGroupIds.filter(id => id != null);
      for (const groupId of validGroupIds) {
        const modifierGroup = await this.modifierGroupRepo.findById(groupId);
        if (!modifierGroup) {
          throw new NotFoundException(`Modifier group with ID ${groupId} not found`);
        }
      }
    }

    // Create item
    const item = await this.menuItemRepo.create({
      tenantId,
      name: dto.name,
      description: dto.description,
      categoryId: dto.categoryId,
      price: dto.price,
      imageUrl: dto.imageUrl,
      tags: dto.tags || [],
      allergens: dto.allergens || [],
      displayOrder: dto.displayOrder ?? 0,
      status: 'DRAFT',
      available: true,
      preparationTime: dto.preparationTime,
      chefRecommended: dto.chefRecommended ?? false,
      popularity: 0, // Initialize to 0
    });

    // Attach modifier groups
    if (dto.modifierGroupIds && dto.modifierGroupIds.length > 0) {
      // Filter out null/undefined values before attaching
      const validGroupIds = dto.modifierGroupIds.filter(id => id != null);
      if (validGroupIds.length > 0) {
        await this.menuItemRepo.attachModifierGroups(item.id, validGroupIds);
      }
    }

    // Invalidate cache when new item created
    await this.menuCache.invalidate(tenantId);
    this.logger.debug(`Cache invalidated after creating menu item for tenant: ${tenantId}`);

    // Return with details
    return this.menuItemRepo.findByIdWithDetails(item.id);
  }

  async findFiltered(tenantId: string, filters: MenuItemFiltersDto) {
    return this.menuItemRepo.findFiltered(tenantId, filters);
  }

  async findById(menuItemId: string) {
    const item = await this.menuItemRepo.findByIdWithDetails(menuItemId);
    if (!item) {
      throw new NotFoundException(ErrorMessages[ErrorCode.MENU_ITEM_NOT_FOUND]);
    }
    
    // Transform modifier groups to flat structure
    const modifierGroups = (item.modifierGroups ?? []).map(
      (mg: { modifierGroup: Record<string, any>; displayOrder: number }) => ({
        ...mg.modifierGroup,
        displayOrder: mg.displayOrder,
      }),
    );
    
    // Get primary photo
    const primaryPhoto =
      (item.photos ?? []).find((p: any) => p.isPrimary) || (item.photos ?? [])[0];
    
    return {
      ...item,
      modifierGroups,
      primaryPhoto: primaryPhoto || null,
    };
  }

  /**
   * Find menu item for public/customer endpoints
   * Uses explicit tenantId instead of auto-filter from JWT context
   * This allows logged-in customers to view menu items from other restaurants
   */
  async findByIdForCustomer(menuItemId: string, tenantId: string) {
    const item = await this.menuItemRepo.findByIdWithDetailsForTenant(menuItemId, tenantId);
    if (!item) {
      throw new NotFoundException(ErrorMessages[ErrorCode.MENU_ITEM_NOT_FOUND]);
    }
    
    // Transform modifier groups to flat structure
    const modifierGroups = (item.modifierGroups ?? []).map(
      (mg: { modifierGroup: Record<string, any>; displayOrder: number }) => ({
        ...mg.modifierGroup,
        displayOrder: mg.displayOrder,
      }),
    );
    
    // Get primary photo
    const primaryPhoto =
      (item.photos ?? []).find((p: any) => p.isPrimary) || (item.photos ?? [])[0];
    
    return {
      ...item,
      modifierGroups,
      primaryPhoto: primaryPhoto || null,
    };
  }

  async update(menuItemId: string, dto: UpdateMenuItemDto) {
    // Get existing item to get tenantId for cache invalidation
    const existingItem = await this.findById(menuItemId);

    if (dto.categoryId) {
      await this.menuCategoryRepo.findById(dto.categoryId);
    }

    // Verify modifier groups if changed
    if (dto.modifierGroupIds && dto.modifierGroupIds.length > 0) {
      // Filter out null/undefined values to prevent Prisma errors
      const validGroupIds = dto.modifierGroupIds.filter(id => id != null);
      for (const groupId of validGroupIds) {
        await this.modifierGroupRepo.findById(groupId);
      }
    }

    // Update item
    const updateData: any = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.categoryId && { categoryId: dto.categoryId }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.allergens !== undefined && { allergens: dto.allergens }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      ...(dto.available !== undefined && { available: dto.available }),
      ...(dto.preparationTime !== undefined && { preparationTime: dto.preparationTime }),
      ...(dto.chefRecommended !== undefined && { chefRecommended: dto.chefRecommended }),
    };

    await this.menuItemRepo.update(menuItemId, updateData);

    // Update modifier groups if provided
    if (dto.modifierGroupIds !== undefined) {
      // Filter out null/undefined values before attaching
      const validGroupIds = dto.modifierGroupIds.filter(id => id != null);
      await this.menuItemRepo.attachModifierGroups(menuItemId, validGroupIds);
    }

    // Invalidate cache after update
    await this.menuCache.invalidate(existingItem.tenantId);
    this.logger.debug(`Cache invalidated after updating menu item: ${menuItemId}`);

    // Return updated item
    return this.menuItemRepo.findByIdWithDetails(menuItemId);
  }

  async delete(menuItemId: string) {
    const existingItem = await this.findById(menuItemId);
    const result = await this.menuItemRepo.softDelete(menuItemId);

    // Invalidate cache after delete
    await this.menuCache.invalidate(existingItem.tenantId);
    this.logger.debug(`Cache invalidated after deleting menu item: ${menuItemId}`);

    return result;
  }

  async getPublicMenu(tenantId: string, filters?: PublicMenuFiltersDto) {
    const {
      search,
      categoryId,
      chefRecommended,
      sortBy = MenuSortByEnum.DISPLAY_ORDER,
      sortOrder = SortOrderEnum.ASC,
      page = 1,
      limit = 20,
    } = filters || {};

    // Only cache if no filters applied (base menu without search/category/chef filters)
    // Filtered results have too many variations to cache effectively
    const canCache = !search && !categoryId && chefRecommended === undefined && page === 1;

    if (canCache) {
      // 1. Try to get from cache (Cache-Aside pattern - read path)
      const cached = await this.menuCache.getMenu(tenantId);
      if (cached) {
        this.logger.debug(`Returning cached menu for tenant: ${tenantId}`);
        return cached;
      }
    }

    // Get paginated items with filters
    const result = await this.menuItemRepo.findPublishedMenuPaginated(tenantId, {
      search,
      categoryId,
      chefRecommended,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    // Collect all menu item IDs for batch rating query
    const menuItemIds = result.data.map((item) => item.id);

    // Batch fetch review stats for all menu items at once (avoid N+1)
    const reviewStats = await this.getMenuItemsRatingStats(tenantId, menuItemIds);

    // Group items by category
    const categoriesMap = new Map<
      string,
      { id: string; name: string; description?: string; displayOrder: number; items: any[] }
    >();

    for (const item of result.data) {
      const category = item.category as {
        id: string;
        name: string;
        description?: string;
        displayOrder: number;
      };
      const categoryId = category.id;

      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: category.id,
          name: category.name,
          description: category.description,
          displayOrder: category.displayOrder,
          items: [],
        });
      }

      // Transform modifier groups
      const modifierGroups = (item.modifierGroups ?? []).map(
        (mg: { modifierGroup: Record<string, any>; displayOrder: number }) => ({
          ...mg.modifierGroup,
          displayOrder: mg.displayOrder,
        }),
      );

      // Get primary photo
      const primaryPhoto =
        (item.photos ?? []).find((p: any) => p.isPrimary) || (item.photos ?? [])[0];

      // Get rating stats for this item
      const itemRating = reviewStats.get(item.id);

      categoriesMap.get(categoryId)!.items.push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl || primaryPhoto?.url,
        primaryPhoto: primaryPhoto || null,
        photos: item.photos || [],
        tags: item.tags,
        allergens: item.allergens,
        available: item.available,
        modifierGroups,
        preparationTime: item.preparationTime,
        chefRecommended: item.chefRecommended,
        popularity: item.popularity,
        displayOrder: item.displayOrder,
        // Rating stats from reviews
        averageRating: itemRating?.averageRating ?? 0,
        totalReviews: itemRating?.totalReviews ?? 0,
      });
    }

    // Sort categories by displayOrder
    const categories = Array.from(categoriesMap.values()).sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    const response = {
      categories,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious,
      },
      publishedAt: new Date(),
      cachedAt: new Date(), // Timestamp when data was cached
    };

    // 3. Store in cache for next request (Cache-Aside pattern - write on miss)
    if (canCache) {
      await this.menuCache.setMenu(tenantId, response);
      this.logger.debug(`Cached menu for tenant: ${tenantId}`);
    }

    return response;
  }

  async publish(itemId: string) {
    const item = await this.findById(itemId); // Verify exists
    const result = await this.menuItemRepo.publish(itemId);

    // Invalidate cache - item now visible to customers
    await this.menuCache.invalidate(item.tenantId);
    this.logger.debug(`Cache invalidated after publishing menu item: ${itemId}`);

    return result;
  }

  async unpublish(itemId: string) {
    const item = await this.findById(itemId); // Verify exists
    const result = await this.menuItemRepo.unpublish(itemId);

    // Invalidate cache - item no longer visible to customers
    await this.menuCache.invalidate(item.tenantId);
    this.logger.debug(`Cache invalidated after unpublishing menu item: ${itemId}`);

    return result;
  }

  async toggleAvailability(itemId: string, available: boolean) {
    await this.findById(itemId); // Verify exists

    return this.menuItemRepo.toggleAvailability(itemId, available);
  }

  async incrementPopularity(itemId: string): Promise<void> {
    await this.menuItemRepo.incrementPopularity(itemId);
  }

  /**
   * Batch fetch rating statistics for multiple menu items
   * Uses a single query to avoid N+1 problem
   */
  private async getMenuItemsRatingStats(
    tenantId: string,
    menuItemIds: string[],
  ): Promise<Map<string, { averageRating: number; totalReviews: number }>> {
    if (menuItemIds.length === 0) {
      return new Map();
    }

    // Single query to get all reviews for all menu items
    const reviews = await this.prisma.itemReview.findMany({
      where: {
        tenantId: tenantId,
        orderItem: {
          menuItemId: {
            in: menuItemIds,
          },
        },
      },
      select: {
        rating: true,
        orderItem: {
          select: {
            menuItemId: true,
          },
        },
      },
    });

    // Aggregate ratings by menu item
    const statsMap = new Map<string, { totalRating: number; count: number }>();
    
    for (const review of reviews) {
      const menuItemId = review.orderItem.menuItemId;
      const existing = statsMap.get(menuItemId) || { totalRating: 0, count: 0 };
      existing.totalRating += review.rating;
      existing.count += 1;
      statsMap.set(menuItemId, existing);
    }

    // Convert to final format
    const result = new Map<string, { averageRating: number; totalReviews: number }>();
    
    for (const [menuItemId, stats] of statsMap) {
      result.set(menuItemId, {
        averageRating: Math.round((stats.totalRating / stats.count) * 10) / 10,
        totalReviews: stats.count,
      });
    }

    return result;
  }

  // async recalculatePopularity(tenantId: string): Promise<void> {
  //   // TODO: Implement when Order model exists
  //   // Query order_items table, count by menu_item_id
  //   // Update menu_items.popularity accordingly
  // }
}
