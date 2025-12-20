// Menu service - handles menu-related API calls (Session-based)
// Refactored to use Strategy Pattern

import { StrategyFactory } from '@/api/strategies';
import { ApiResponse, MenuItem } from '@/types';

// Create strategy instance (mock or real based on API_MODE)
const menuStrategy = StrategyFactory.createMenuStrategy();

export const MenuService = {
  /**
   * Get public menu (session-based, no token needed)
   * Cookie automatically sent by axios (withCredentials: true)
   */
  async getPublicMenu(): Promise<ApiResponse<{
    items: MenuItem[];
    categories: string[];
  }>> {
    return menuStrategy.getPublicMenu();
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
