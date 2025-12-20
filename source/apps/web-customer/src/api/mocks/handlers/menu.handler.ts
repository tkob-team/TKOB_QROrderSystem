import { ApiResponse, MenuItem } from '@/types';
import { mockMenuItems, mockCategories } from '../data';
import { delay, createSuccessResponse, createErrorResponse } from '../utils';

export const menuHandlers = {
  /**
   * Get public menu (requires valid QR token)
   */
  async getPublicMenu(token: string): Promise<ApiResponse<{
    items: MenuItem[];
    categories: string[];
  }>> {
    await delay(300);
    
    // Validate token
    if (!token || token !== 'mock-token-123') {
      return createErrorResponse('Invalid QR token');
    }
    
    return createSuccessResponse({
      items: mockMenuItems,
      categories: mockCategories,
    });
  },
  
  /**
   * Get single menu item by ID
   */
  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    await delay(200);
    
    const item = mockMenuItems.find(i => i.id === id);
    
    if (!item) {
      return createErrorResponse('Item not found');
    }
    
    return createSuccessResponse(item);
  },
  
  /**
   * Search menu items
   */
  async searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>> {
    await delay(250);
    
    const results = mockMenuItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    
    return createSuccessResponse(results);
  },
  
  /**
   * Get items by category
   */
  async getItemsByCategory(category: string): Promise<ApiResponse<MenuItem[]>> {
    await delay(200);
    
    const items = mockMenuItems.filter(item => item.category === category);
    
    return createSuccessResponse(items);
  },
};
