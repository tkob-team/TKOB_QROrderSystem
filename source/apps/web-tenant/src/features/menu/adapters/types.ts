/**
 * Menu Adapter Interface
 * Contract for both Mock and Real API implementations
 */

import type {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  MenuCategoryResponseDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  MenuItemResponseDto,
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
  ModifierGroupResponseDto,
} from '@/services/generated/models';

export interface IMenuAdapter {
  // Categories
  listCategories(params?: { activeOnly?: boolean }): Promise<{ data: MenuCategoryResponseDto[]; meta: any }>;
  getCategoryById(id: string): Promise<MenuCategoryResponseDto>;
  createCategory(data: CreateMenuCategoryDto): Promise<MenuCategoryResponseDto>;
  updateCategory(id: string, data: UpdateMenuCategoryDto): Promise<MenuCategoryResponseDto>;
  deleteCategory(id: string): Promise<void>;

  // Menu Items
  listMenuItems(params?: { categoryId?: string; status?: string; available?: boolean; search?: string; chefRecommended?: boolean; sortBy?: string; sortOrder?: string }): Promise<{ data: MenuItemResponseDto[]; meta: any }>;
  getMenuItemById(id: string): Promise<MenuItemResponseDto>;
  createMenuItem(data: CreateMenuItemDto): Promise<MenuItemResponseDto>;
  updateMenuItem(id: string, data: UpdateMenuItemDto): Promise<MenuItemResponseDto>;
  deleteMenuItem(id: string): Promise<void>;
  publishMenuItem(id: string, status: 'DRAFT' | 'PUBLISHED'): Promise<MenuItemResponseDto>;

  // Modifier Groups
  listModifierGroups(params?: { activeOnly?: boolean }): Promise<ModifierGroupResponseDto[]>;
  getModifierGroupById(id: string): Promise<ModifierGroupResponseDto>;
  createModifierGroup(data: CreateModifierGroupDto): Promise<ModifierGroupResponseDto>;
  updateModifierGroup(id: string, data: UpdateModifierGroupDto): Promise<ModifierGroupResponseDto>;
  deleteModifierGroup(id: string): Promise<void>;
}
