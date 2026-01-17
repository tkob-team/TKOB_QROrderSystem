// Real Menu Adapter for feature - calls backend API

import apiClient from '@/api/client';
import { ApiResponse, MenuItem, PhotoDto, ModifierGroupDto } from '@/types';
import { IMenuAdapter } from '../adapter.interface';

interface MenuCategoryDto {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
}

interface MenuItemDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  primaryPhoto?: PhotoDto;
  photos?: PhotoDto[];
  tags?: string[];
  allergens?: string[];
  modifierGroups?: ModifierGroupDto[];
  preparationTime?: number;
  chefRecommended?: boolean;
  popularity?: number;
  displayOrder: number;
  available?: boolean;
  status?: string;
}

interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PublicMenuResponseDto {
  categories: Array<{
    id: string;
    name: string;
    description?: string;
    displayOrder: number;
    items: MenuItemDto[];
  }>;
  pagination?: PaginationDto;
  publishedAt: string;
}

export class MenuAdapter implements IMenuAdapter {
  async getPublicMenu(): Promise<ApiResponse<{ items: MenuItem[]; categories: string[] }>> {
    // Use public menu (backend exposes at /menu)
    const response = await apiClient.get<{ success: boolean; data: PublicMenuResponseDto }>('/menu');

    // Backend wraps response in { success, data } via TransformInterceptor
    const menuData = response.data.data;

    // Transform backend response to frontend format
    // Backend already filters by status='PUBLISHED', so we only receive published items
    const items: MenuItem[] = menuData.categories.flatMap(cat =>
      cat.items.map(item => {
        const rawPrice: any = (item as any).price;
        const numericPrice =
          typeof rawPrice === 'number'
            ? rawPrice
            : rawPrice != null
              ? parseFloat(rawPrice)
              : 0;

        // Determine badge based on backend flags
        let badge: 'Chef\'s recommendation' | 'Popular' | undefined;
        if (item.chefRecommended) {
          badge = 'Chef\'s recommendation';
        } else if (item.popularity && item.popularity > 0) {
          badge = 'Popular';
        }

        // Determine availability based on the 'available' boolean field
        // Backend already filtered by status='PUBLISHED', so all items here are published
        // We only need to check the 'available' field
        let availability: 'Available' | 'Unavailable' | 'Sold out';

        if (item.available === false) {
          availability = 'Unavailable';
        } else {
          // Default to Available (available === true or undefined means available)
          // Since backend already filters by available=true, all items should be available
          availability = 'Available';
        }

        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          category: cat.name,
          basePrice: Number.isFinite(numericPrice) ? numericPrice : 0,
          imageUrl: item.primaryPhoto?.url || item.imageUrl || '',
          primaryPhoto: item.primaryPhoto,
          photos: item.photos,
          modifierGroups: item.modifierGroups,
          preparationTime: item.preparationTime,
          chefRecommended: item.chefRecommended,
          popularity: item.popularity,
          dietary: item.tags as any,
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
  }

  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    // Use public endpoint that accepts session cookie
    const response = await apiClient.get<{ success: boolean; data: MenuItemDto }>(`/menu/item/public/${id}`);
    
    // Backend uses TransformInterceptor, so data is already in response.data.data
    const item = response.data.data;
    const rawPrice: any = (item as any).price;
    const numericPrice = typeof rawPrice === 'number' ? rawPrice : rawPrice != null ? parseFloat(rawPrice) : 0;

    // Transform to frontend format
    let badge: 'Chef\'s recommendation' | 'Popular' | undefined;
    if (item.chefRecommended) {
      badge = 'Chef\'s recommendation';
    } else if (item.popularity && item.popularity > 0) {
      badge = 'Popular';
    }

    const availability: 'Available' | 'Unavailable' | 'Sold out' = 
      item.available === false ? 'Unavailable' : 'Available';

    return {
      success: true,
      data: {
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: '', // Category name not included in single item response
        basePrice: Number.isFinite(numericPrice) ? numericPrice : 0,
        imageUrl: item.primaryPhoto?.url || item.imageUrl || '',
        primaryPhoto: item.primaryPhoto,
        photos: item.photos,
        modifierGroups: item.modifierGroups,
        preparationTime: item.preparationTime,
        chefRecommended: item.chefRecommended,
        popularity: item.popularity,
        dietary: item.tags as any,
        badge,
        availability,
      }
    };
  }

  async searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>> {
    const response = await apiClient.get<{ success: boolean; data: ApiResponse<MenuItem[]> }>(`/api/menu/search`, { params: { q: query } });
    return response.data.data;
  }
}
