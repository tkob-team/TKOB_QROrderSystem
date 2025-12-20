// Real Menu Strategy - calls actual backend API

import apiClient from '@/api/client';
import { ApiResponse, MenuItem } from '@/types';
import { IMenuStrategy } from '../interfaces';

interface MenuCategoryDto {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuItemDto {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  imageUrl?: string;
  status: string;
  available: boolean;
  tags?: string[];
  allergens?: string[];
  displayOrder: number;
  category?: MenuCategoryDto;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface PublicMenuResponseDto {
  categories: Array<MenuCategoryDto & {
    items: MenuItemDto[];
  }>;
  publishedAt: string;
}

export class RealMenuStrategy implements IMenuStrategy {
  async getPublicMenu(): Promise<ApiResponse<{ items: MenuItem[]; categories: string[] }>> {
    const response = await apiClient.get<{ success: boolean; data: PublicMenuResponseDto }>('/menu');
    
    // Backend wraps response in { success, data } via TransformInterceptor
    const menuData = response.data.data;
    
    // Transform backend response to frontend format
    const items: MenuItem[] = menuData.categories.flatMap(cat =>
      cat.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: cat.name,
        basePrice: item.price,
        imageUrl: item.imageUrl || '',
        dietary: item.tags as any,
        availability: item.available ? ('Available' as const) : ('Sold out' as const),
      }))
    );
    
    const categories = menuData.categories.map(cat => cat.name);
    
    return {
      success: true,
      data: { items, categories },
    };
  }
  
  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    const response = await apiClient.get<{ success: boolean; data: ApiResponse<MenuItem> }>(`/api/menu/items/${id}`);
    return response.data.data;
  }
  
  async searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>> {
    const response = await apiClient.get<{ success: boolean; data: ApiResponse<MenuItem[]> }>(`/api/menu/search`, { params: { q: query } });
    return response.data.data;
  }
}
