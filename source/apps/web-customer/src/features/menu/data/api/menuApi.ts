/**
 * Menu API Adapter (Real Implementation)
 * Uses Orval-generated API functions for type-safe API calls
 * 
 * Architecture:
 * - Generated functions from @/services/generated/menu-public
 * - Wraps generated calls to match IMenuAdapter interface
 * - Transforms backend DTOs to frontend models
 */

import {
  publicMenuControllerGetPublicMenu,
  type PublicMenuResponseDto,
} from '@/services/generated/menu-public/menu-public';

import {
  menuItemsControllerFindOne,
  type MenuItemResponseDto,
} from '@/services/generated/menu-items/menu-items';

import type { MenuItem, ApiResponse } from '@/types';
import type { IMenuAdapter } from '../adapter.interface';

/**
 * Transform backend DTO to frontend MenuItem model
 */
function transformMenuItem(dto: any, categoryName: string = 'Unknown'): MenuItem {
  const rawPrice: any = dto.price;
  const numericPrice =
    typeof rawPrice === 'number'
      ? rawPrice
      : rawPrice != null
        ? parseFloat(rawPrice)
        : 0;

  // Determine badge based on backend flags
  let badge: 'Chef\'s recommendation' | 'Popular' | undefined;
  if (dto.chefRecommended) {
    badge = 'Chef\'s recommendation';
  } else if (dto.popularity && dto.popularity > 0) {
    badge = 'Popular';
  }

  // Determine availability
  let availability: 'Available' | 'Unavailable' | 'Sold out';
  if (dto.available === false) {
    availability = 'Unavailable';
  } else {
    availability = 'Available';
  }

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    category: categoryName,
    basePrice: Number.isFinite(numericPrice) ? numericPrice : 0,
    imageUrl: dto.primaryPhoto?.url || dto.imageUrl || '',
    primaryPhoto: dto.primaryPhoto,
    photos: dto.photos,
    modifierGroups: dto.modifierGroups,
    preparationTime: dto.preparationTime,
    chefRecommended: dto.chefRecommended,
    popularity: dto.popularity,
    dietary: dto.tags as any,
    badge,
    availability,
  };
}

/**
 * Menu API Adapter
 * Real API implementation using generated functions
 */
export const menuApi: IMenuAdapter = {
  /**
   * Get public menu (customer-facing)
   * Uses session cookie (table_session_id) for tenant context
   */
  async getPublicMenu(): Promise<ApiResponse<{ items: MenuItem[]; categories: string[] }>> {
    const response = await publicMenuControllerGetPublicMenu();

    // Transform backend response to frontend format
    const items: MenuItem[] = response.categories.flatMap(cat =>
      cat.items.map(item => transformMenuItem(item, cat.name))
    );

    const categories = response.categories.map(cat => cat.name);

    return {
      success: true,
      data: { items, categories },
    };
  },

  /**
   * Get single menu item by ID
   * Uses public endpoint with session cookie authentication
   */
  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    // Call public endpoint directly instead of generated function
    // because generated function uses protected endpoint with JWT
    const { MenuAdapter } = await import('./menu.adapter');
    const adapter = new MenuAdapter();
    return adapter.getMenuItem(id);
  },

  /**
   * Search menu items
   * Note: Backend doesn't have dedicated search endpoint yet
   * Fallback: fetch all and filter client-side
   */
  async searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>> {
    // Get all items
    const { data } = await this.getPublicMenu();
    
    // Filter by query
    const lowerQuery = query.toLowerCase();
    const filtered = data.items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
    );

    return {
      success: true,
      data: filtered,
    };
  },
};
