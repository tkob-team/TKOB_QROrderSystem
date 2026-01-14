// Menu data layer types

import { ApiResponse, MenuItem } from '@/types';

export interface IMenuStrategy {
  getPublicMenu(): Promise<ApiResponse<{
    items: MenuItem[];
    categories: string[];
  }>>;

  getMenuItem(id: string): Promise<ApiResponse<MenuItem>>;

  searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>>;
}
