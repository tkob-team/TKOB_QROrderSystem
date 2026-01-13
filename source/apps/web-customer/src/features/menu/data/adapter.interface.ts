// Menu feature adapter interface

import { ApiResponse, MenuItem } from '@/types';

/**
 * Menu adapter interface
 * Defines the contract for menu data access implementations
 */
export interface IMenuAdapter {
  getPublicMenu(): Promise<ApiResponse<{
    items: MenuItem[];
    categories: string[];
  }>>;

  getMenuItem(id: string): Promise<ApiResponse<MenuItem>>;

  searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>>;
}
