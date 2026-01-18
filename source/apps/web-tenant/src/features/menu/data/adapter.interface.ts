/**
 * Menu Adapter Interface (canonical)
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
  findOne(id: string): Promise<MenuCategoryResponseDto>;
  create(data: CreateMenuCategoryDto): Promise<MenuCategoryResponseDto>;
  update(id: string, data: UpdateMenuCategoryDto): Promise<MenuCategoryResponseDto>;
  delete(id: string): Promise<{ success: boolean } | void>;
}

export interface IMenuItemsAdapter {
  findAll(params?: any): Promise<MenuItemResponseDto[] | { data: MenuItemResponseDto[]; meta?: any }>;
  findOne(id: string): Promise<MenuItemResponseDto>;
  create(data: CreateMenuItemDto): Promise<MenuItemResponseDto>;
  update(id: string, data: UpdateMenuItemDto): Promise<MenuItemResponseDto>;
  delete(id: string): Promise<{ success: boolean } | void>;
  toggleAvailability?(id: string, data: { isAvailable: boolean }): Promise<MenuItemResponseDto | { success: boolean }>;
  togglePublish?(id: string, data: { publish: boolean }): Promise<MenuItemResponseDto>;
}

export interface IModifiersAdapter {
  findAll(): Promise<ModifierGroupResponseDto[]>;
  create(data: CreateModifierGroupDto): Promise<ModifierGroupResponseDto>;
  update(id: string, data: UpdateModifierGroupDto): Promise<ModifierGroupResponseDto>;
  delete(id: string): Promise<{ success: boolean } | void>;
}

export interface IMenuPhotosAdapter {
  upload(itemId: string, data: { file: File }): Promise<any>;
  getPhotos(itemId: string): Promise<any[]>;
  delete(itemId: string, photoId: string): Promise<{ success: boolean }>;
  setPrimary(itemId: string, photoId: string): Promise<any>;
  bulkUpload?(itemId: string, data: { files: File[] }): Promise<any[]>;
  updateOrder?(itemId: string, photoId: string, data: { displayOrder: number }): Promise<{ success: boolean }>;
}

export interface IMenuAdapter {
  categories: IMenuCategoriesAdapter;
  items: IMenuItemsAdapter;
  modifiers: IModifiersAdapter;
  photos: IMenuPhotosAdapter;
}
