// Menu service - handles menu-related API calls

import apiClient from '@/api/client';
import { ApiResponse, MenuItem } from '@/types';

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
   * Cookie automatically sent by axios (withCredentials: true)
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
        console.log('[MenuService.getPublicMenu] calling /menu/public', options)
      }
      // Swagger documents tenantId as query param; send it in params alongside pagination/sort
      const response = await apiClient.get<{ success: boolean; data: PublicMenuResponseDto }>('/menu/public', {
        params: {
          tenantId,
          page: 1,
          limit: 100,
          sortBy: options?.sortBy || 'displayOrder',
          sortOrder: options?.sortOrder || 'asc',
          ...(options?.chefRecommended !== undefined && { chefRecommended: options.chefRecommended }),
          ...(options?.search && { search: options.search }),
          ...(options?.categoryId && { categoryId: options.categoryId }),
        },
      });
    
    // Backend wraps response in { success, data } via TransformInterceptor
      const menuData = response.data.data;
    
    // Transform backend response to frontend format
    const items: MenuItem[] = menuData.categories.flatMap(cat =>
      cat.items.map(item => {
        const rawPrice = item.price as number | string | undefined;
        const numericPrice =
          typeof rawPrice === 'number'
            ? rawPrice
            : rawPrice != null
              ? parseFloat(String(rawPrice))
              : 0;

        // Map availability: available=false -> Unavailable, otherwise Available
        const availability: 'Available' | 'Unavailable' = item.available === false ? 'Unavailable' : 'Available';

        // Determine badge based on backend flags
        let badge: "Chef's recommendation" | 'Popular' | undefined;
        if (item.chefRecommended) {
          badge = "Chef's recommendation";
        } else if (item.popularity && item.popularity > 0) {
          badge = 'Popular';
        }

        // Normalize modifier groups to ensure priceDelta is numeric
        const normalizedModifierGroups = item.modifierGroups?.map(g => ({
          ...g,
          options: g.options.map(o => ({
            ...o,
            priceDelta: typeof o.priceDelta === 'number' ? o.priceDelta : parseFloat(String(o.priceDelta)) || 0,
          })),
        }));

        // Filter dietary tags to supported set
        const allowedDietary = ['Vegan', 'Vegetarian', 'Spicy', 'Gluten-Free'] as const;
        const dietary = ((item.tags || []).filter(t => (allowedDietary as readonly string[]).includes(t)) as MenuItem['dietary']);

        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          category: cat.name,
          basePrice: Number.isFinite(numericPrice) ? numericPrice : 0,
          imageUrl: item.primaryPhoto?.url || item.imageUrl || '',
          primaryPhoto: item.primaryPhoto || undefined,
          photos: item.photos,
          modifierGroups: normalizedModifierGroups,
          preparationTime: item.preparationTime,
          chefRecommended: item.chefRecommended,
          popularity: item.popularity,
          dietary,
          badge,
          availability,
        };
      })
    );
    
    const categories = menuData.categories.map(cat => cat.name);
    
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
    const response = await apiClient.get<{ success: boolean; data: ApiResponse<MenuItem> }>(`/api/menu/items/${id}`);
    return response.data.data;
  },
  
  /**
   * Search menu items
   */
  async searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>> {
    const response = await apiClient.get<{ success: boolean; data: ApiResponse<MenuItem[]> }>(`/api/menu/search`, { params: { q: query } });
    return response.data.data;
  },
};
