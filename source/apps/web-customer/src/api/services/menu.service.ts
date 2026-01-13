// Menu service - handles menu-related API calls
// Refactored to use Strategy Pattern

import { StrategyFactory } from '@/api/strategies';
import { ApiResponse, MenuItem } from '@/types';

// Create strategy instance (mock or real based on API_MODE)
const menuStrategy = StrategyFactory.createMenuStrategy();

interface MenuCategoryDto {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
}

interface PhotoDto {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

interface ModifierOptionDto {
  id: string;
  name: string;
  priceDelta: number | string;
  displayOrder: number;
  active: boolean;
}

interface ModifierGroupDto {
  id: string;
  name: string;
  description?: string;
  type: string;
  required: boolean;
  minChoices: number;
  maxChoices: number;
  displayOrder: number;
  active: boolean;
  options: ModifierOptionDto[];
}

interface MenuItemDto {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string;
  primaryPhoto?: PhotoDto | null;
  photos?: PhotoDto[];
  available?: boolean;
  tags?: string[];
  allergens?: string[];
  modifierGroups?: ModifierGroupDto[];
  preparationTime?: number;
  chefRecommended?: boolean;
  popularity?: number;
  displayOrder: number;
}

interface PublicMenuResponseDto {
  categories: Array<MenuCategoryDto & {
    items: MenuItemDto[];
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  publishedAt: string;
}

export const MenuService = {
  /**
   * Get public menu (session-based, no token needed)
   * Uses strategy pattern for mock/real API
   */
  async getPublicMenu(
    tenantId?: string,
    options?: {
      chefRecommended?: boolean;
      sortBy?: 'displayOrder' | 'popularity' | 'price' | 'name';
      sortOrder?: 'asc' | 'desc';
      search?: string;
      categoryId?: string;
    }
  ): Promise<ApiResponse<{
    items: MenuItem[];
    categories: string[];
  }>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[MenuService.getPublicMenu] using strategy pattern', options)
      }
      
      // Use strategy to get menu data
      const response = await menuStrategy.getPublicMenu();
      
      if (!response.success || !response.data) {
        return response;
      }

      // Data from strategy is already in MenuItem format (from mock)
      const items = response.data.items;
      const categories = response.data.categories;
    
      return {
        success: true,
        data: { items, categories },
      };
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const e = err as { response?: { data?: unknown } };
        console.error('[MenuService.getPublicMenu] failed response', e.response?.data);
      } else {
        console.error('[MenuService.getPublicMenu] failed', err);
      }
      throw err;
    }
  },
  
  /**
   * Get single menu item by ID
   */
  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    return menuStrategy.getMenuItem(id);
  },
  
  /**
   * Search menu items
   */
  async searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>> {
    return menuStrategy.searchMenuItems(query);
  },
};
