/**
 * Menu API Adapter
 * Real API implementation using Orval generated functions
 */

import {
  menuCategoryControllerFindAll,
  menuCategoryControllerCreate,
  menuCategoryControllerUpdate,
  menuCategoryControllerDelete,
} from '@/services/generated/menu-categories/menu-categories';

import {
  menuItemsControllerFindAll,
  menuItemsControllerCreate,
  menuItemsControllerUpdate,
  menuItemsControllerDelete,
} from '@/services/generated/menu-items/menu-items';

import {
  modifierGroupControllerFindAll,
  modifierGroupControllerCreate,
  modifierGroupControllerUpdate,
  modifierGroupControllerDelete,
} from '@/services/generated/menu-modifiers/menu-modifiers';

import {
  menuPhotoControllerUploadPhoto,
  menuPhotoControllerDeletePhoto,
} from '@/services/generated/menu-photos/menu-photos';

import type {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
} from '@/services/generated/models';

/**
 * Menu Categories API
 */
export const menuCategoriesApi = {
  findAll: menuCategoryControllerFindAll,
  create: menuCategoryControllerCreate,
  update: menuCategoryControllerUpdate,
  delete: menuCategoryControllerDelete,
};

/**
 * Menu Items API
 */
export const menuItemsApi = {
  findAll: menuItemsControllerFindAll,
  create: menuItemsControllerCreate,
  update: menuItemsControllerUpdate,
  delete: menuItemsControllerDelete,
};

/**
 * Modifiers API
 */
export const modifiersApi = {
  findAll: modifierGroupControllerFindAll,
  create: modifierGroupControllerCreate,
  update: modifierGroupControllerUpdate,
  delete: modifierGroupControllerDelete,
};

/**
 * Menu Photos API
 */
export const menuPhotosApi = {
  upload: menuPhotoControllerUploadPhoto,
  delete: menuPhotoControllerDeletePhoto,
};

// Unified menu API
export const menuApi = {
  categories: menuCategoriesApi,
  items: menuItemsApi,
  modifiers: modifiersApi,
  photos: menuPhotosApi,
};
