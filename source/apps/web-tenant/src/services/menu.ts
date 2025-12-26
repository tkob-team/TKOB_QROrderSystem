/**
 * Menu Service
 * Public API for menu operations
 * Uses adapter pattern to switch between Mock and Real API
 */

import { menuAdapter } from '@/features/menu-management/adapters';
import type {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
} from '@/services/generated/models';

class MenuService {
  // Categories
  async listCategories(params?: { activeOnly?: boolean }) {
    return menuAdapter.listCategories(params);
  }

  async getCategoryById(id: string) {
    return menuAdapter.getCategoryById(id);
  }

  async createCategory(data: CreateMenuCategoryDto) {
    return menuAdapter.createCategory(data);
  }

  async updateCategory(id: string, data: UpdateMenuCategoryDto) {
    return menuAdapter.updateCategory(id, data);
  }

  async deleteCategory(id: string) {
    return menuAdapter.deleteCategory(id);
  }

  // Menu Items
  async listMenuItems() {
    return menuAdapter.listMenuItems();
  }

  async getMenuItemById(id: string) {
    return menuAdapter.getMenuItemById(id);
  }

  async createMenuItem(data: CreateMenuItemDto) {
    return menuAdapter.createMenuItem(data);
  }

  async updateMenuItem(id: string, data: UpdateMenuItemDto) {
    return menuAdapter.updateMenuItem(id, data);
  }

  async deleteMenuItem(id: string) {
    return menuAdapter.deleteMenuItem(id);
  }

  // Modifier Groups
  async listModifierGroups(params?: { activeOnly?: boolean }) {
    return menuAdapter.listModifierGroups(params);
  }

  async getModifierGroupById(id: string) {
    return menuAdapter.getModifierGroupById(id);
  }

  async createModifierGroup(data: CreateModifierGroupDto) {
    return menuAdapter.createModifierGroup(data);
  }

  async updateModifierGroup(id: string, data: UpdateModifierGroupDto) {
    return menuAdapter.updateModifierGroup(id, data);
  }

  async deleteModifierGroup(id: string) {
    return menuAdapter.deleteModifierGroup(id);
  }
}

export const menuService = new MenuService();
export default menuService;
