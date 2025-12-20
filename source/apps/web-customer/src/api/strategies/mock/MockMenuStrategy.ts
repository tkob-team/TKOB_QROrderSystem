// Mock Menu Strategy - returns mock data

import { menuHandlers } from '@/api/mocks';
import { ApiResponse, MenuItem } from '@/types';
import { IMenuStrategy } from '../interfaces';

export class MockMenuStrategy implements IMenuStrategy {
  async getPublicMenu(): Promise<ApiResponse<{ items: MenuItem[]; categories: string[] }>> {
    return menuHandlers.getPublicMenu('mock-token-123');
  }
  
  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    return menuHandlers.getMenuItem(id);
  }
  
  async searchMenuItems(query: string): Promise<ApiResponse<MenuItem[]>> {
    return menuHandlers.searchMenuItems(query);
  }
}
