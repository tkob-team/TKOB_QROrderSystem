/**
 * Menu Service
 * Public API for menu operations (infra layer)
 * Uses generated HTTP clients; does not depend on feature adapters.
 */

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
  menuItemsControllerToggleAvailability,
  menuItemsControllerTogglePublish,
} from '@/services/generated/menu-items/menu-items';
import {
  modifierGroupControllerFindAll,
  modifierGroupControllerFindOne,
  modifierGroupControllerCreate,
  modifierGroupControllerUpdate,
  modifierGroupControllerDelete,
} from '@/services/generated/menu-modifiers/menu-modifiers';
import type {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
  PublishMenuItemDto,
  ToggleAvailabilityDto,
  MenuItemsControllerFindAllParams,
  ModifierGroupControllerFindAllParams,
  MenuCategoryControllerFindAllParams,
} from '@/services/generated/models';

class MenuService {
  // Categories
  async listCategories(params?: MenuCategoryControllerFindAllParams) {
    return menuCategoryControllerFindAll(params);
  }

  async getCategoryById(id: string) {
    return menuCategoryControllerFindOne(id);
  }

  async createCategory(data: CreateMenuCategoryDto) {
    return menuCategoryControllerCreate(data);
  }

  async updateCategory(id: string, data: UpdateMenuCategoryDto) {
    return menuCategoryControllerUpdate(id, data);
  }

  async deleteCategory(id: string) {
    return menuCategoryControllerDelete(id);
  }

  // Menu Items
  async listMenuItems(params?: MenuItemsControllerFindAllParams) {
    return menuItemsControllerFindAll(params);
  }

  async getMenuItemById(id: string) {
    return menuItemsControllerFindOne(id);
  }

  async createMenuItem(data: CreateMenuItemDto) {
    return menuItemsControllerCreate(data);
  }

  async updateMenuItem(id: string, data: UpdateMenuItemDto) {
    return menuItemsControllerUpdate(id, data);
  }

  async deleteMenuItem(id: string) {
    return menuItemsControllerDelete(id);
  }

  async publishMenuItem(id: string, publish: boolean) {
    const payload: PublishMenuItemDto = { publish };
    return menuItemsControllerTogglePublish(id, payload);
  }

  // Modifier Groups
  async listModifierGroups(params?: ModifierGroupControllerFindAllParams) {
    return modifierGroupControllerFindAll(params);
  }

  async getModifierGroupById(id: string) {
    return modifierGroupControllerFindOne(id);
  }

  async createModifierGroup(data: CreateModifierGroupDto) {
    return modifierGroupControllerCreate(data);
  }

  async updateModifierGroup(id: string, data: UpdateModifierGroupDto) {
    return modifierGroupControllerUpdate(id, data);
  }

  async deleteModifierGroup(id: string) {
    return modifierGroupControllerDelete(id);
  }

  async toggleAvailability(id: string, payload: ToggleAvailabilityDto) {
    return menuItemsControllerToggleAvailability(id, payload);
  }
}

export const menuService = new MenuService();
export default menuService;
