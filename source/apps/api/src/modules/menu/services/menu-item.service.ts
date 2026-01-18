import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly menuItemRepo: MenuItemsRepository,
    private readonly menuCategoryRepo: MenuCategoryRepository,
    private readonly modifierGroupRepo: ModifierGroupRepository,
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

  async update(menuItemId: string, dto: UpdateMenuItemDto) {
    await this.findById(menuItemId);

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

    // Return updated item
    return this.menuItemRepo.findByIdWithDetails(menuItemId);
  }

  async delete(menuItemId: string) {
    await this.findById(menuItemId);
    return this.menuItemRepo.softDelete(menuItemId);
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
      });
    }

    // Sort categories by displayOrder
    const categories = Array.from(categoriesMap.values()).sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    return {
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
    };
  }

  async publish(itemId: string) {
    await this.findById(itemId); // Verify exists

    return this.menuItemRepo.publish(itemId);
  }

  async unpublish(itemId: string) {
    await this.findById(itemId); // Verify exists

    return this.menuItemRepo.unpublish(itemId);
  }

  async toggleAvailability(itemId: string, available: boolean) {
    await this.findById(itemId); // Verify exists

    return this.menuItemRepo.toggleAvailability(itemId, available);
  }

  async incrementPopularity(itemId: string): Promise<void> {
    await this.menuItemRepo.incrementPopularity(itemId);
  }

  // async recalculatePopularity(tenantId: string): Promise<void> {
  //   // TODO: Implement when Order model exists
  //   // Query order_items table, count by menu_item_id
  //   // Update menu_items.popularity accordingly
  // }
}
