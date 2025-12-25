/**
 * Menu API Adapter
 * Real API implementation using orval-generated hooks
 */

import type { IMenuAdapter } from './types';
import {
  menuCategoryControllerFindAll,
  menuCategoryControllerFindOne,
  menuCategoryControllerCreate,
  menuCategoryControllerUpdate,
  menuCategoryControllerDelete,
} from '@/services/generated/menu-categories/menu-categories';
import {
  menuItemsControllerFindAll,
  menuItemsControllerFindOne,
  menuItemsControllerCreate,
  menuItemsControllerUpdate,
  menuItemsControllerDelete,
} from '@/services/generated/menu-items/menu-items';
import {
  modifierGroupControllerFindAll,
  modifierGroupControllerFindOne,
  modifierGroupControllerCreate,
  modifierGroupControllerUpdate,
  modifierGroupControllerDelete,
} from '@/services/generated/menu-modifiers/menu-modifiers';

export class MenuApiAdapter implements IMenuAdapter {
  // Categories
  async listCategories() {
    return menuCategoryControllerFindAll();
  }

  async getCategoryById(id: string) {
    return menuCategoryControllerFindOne(id);
  }

  async createCategory(data: any) {
    return menuCategoryControllerCreate(data);
  }

  async updateCategory(id: string, data: any) {
    return menuCategoryControllerUpdate(id, data);
  }

  async deleteCategory(id: string) {
    await menuCategoryControllerDelete(id);
  }

  // Menu Items
  async listMenuItems() {
    return menuItemsControllerFindAll();
  }

  async getMenuItemById(id: string) {
    return menuItemsControllerFindOne(id);
  }

  async createMenuItem(data: any) {
    return menuItemsControllerCreate(data);
  }

  async updateMenuItem(id: string, data: any) {
    return menuItemsControllerUpdate(id, data);
  }

  async deleteMenuItem(id: string) {
    await menuItemsControllerDelete(id);
  }

  // Modifier Groups
  async listModifierGroups(params?: { activeOnly?: boolean }) {
    return modifierGroupControllerFindAll(params);
  }

  async getModifierGroupById(id: string) {
    return modifierGroupControllerFindOne(id);
  }

  async createModifierGroup(data: any) {
    return modifierGroupControllerCreate(data);
  }

  async updateModifierGroup(id: string, data: any) {
    return modifierGroupControllerUpdate(id, data);
  }

  async deleteModifierGroup(id: string) {
    await modifierGroupControllerDelete(id);
  }
}
