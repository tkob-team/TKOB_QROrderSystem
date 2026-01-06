/**
 * Menu Adapter Interface
 * Defines contract for menu data operations
 */

import type {
  MenuCategoryResponseDto,
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  MenuItemResponseDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  ModifierGroupResponseDto,
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
} from '@/services/generated/models';

export interface IMenuCategoriesAdapter {
  findAll(): Promise<MenuCategoryResponseDto[]>;
  create(data: CreateMenuCategoryDto): Promise<MenuCategoryResponseDto>;
  update(id: string, data: UpdateMenuCategoryDto): Promise<MenuCategoryResponseDto>;
  delete(id: string): Promise<{ success: boolean }>;
}

export interface IMenuItemsAdapter {
  findAll(): Promise<MenuItemResponseDto[]>;
  create(data: CreateMenuItemDto): Promise<MenuItemResponseDto>;
  update(id: string, data: UpdateMenuItemDto): Promise<MenuItemResponseDto>;
  delete(id: string): Promise<{ success: boolean }>;
}

export interface IModifiersAdapter {
  findAll(): Promise<ModifierGroupResponseDto[]>;
  create(data: CreateModifierGroupDto): Promise<ModifierGroupResponseDto>;
  update(id: string, data: UpdateModifierGroupDto): Promise<ModifierGroupResponseDto>;
  delete(id: string): Promise<{ success: boolean }>;
}

export interface IMenuPhotosAdapter {
  upload(file: File): Promise<{ url: string; id: string }>;
  delete(id: string): Promise<{ success: boolean }>;
}

export interface IMenuAdapter {
  categories: IMenuCategoriesAdapter;
  items: IMenuItemsAdapter;
  modifiers: IModifiersAdapter;
  photos: IMenuPhotosAdapter;
}
