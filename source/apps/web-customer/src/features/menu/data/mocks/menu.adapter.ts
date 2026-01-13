// Mock Menu Adapter for feature - delegates to global mocks

import { menuHandlers } from '@/api/mocks';
import { ApiResponse, MenuItem } from '@/types';
import { IMenuAdapter } from '../adapter.interface';

export class MockMenuAdapter implements IMenuAdapter {
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
