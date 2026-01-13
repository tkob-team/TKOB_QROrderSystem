/**
 * Menu API Adapter (structured)
 * Real API implementation using Orval generated functions
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
  menuPhotoControllerGetPhotos,
  menuPhotoControllerSetPrimary,
  menuPhotoControllerUploadPhotos,
  menuPhotoControllerUpdateOrder,
} from '@/services/generated/menu-photos/menu-photos';

/**
 * Menu Categories API
 */
export const menuCategoriesApi = {
  findAll: menuCategoryControllerFindAll,
  findOne: menuCategoryControllerFindOne,
  create: menuCategoryControllerCreate,
  update: menuCategoryControllerUpdate,
  delete: menuCategoryControllerDelete,
};

/**
 * Menu Items API
 */
export const menuItemsApi = {
  findAll: menuItemsControllerFindAll,
  findOne: menuItemsControllerFindOne,
  create: menuItemsControllerCreate,
  update: menuItemsControllerUpdate,
  delete: menuItemsControllerDelete,
  toggleAvailability: menuItemsControllerToggleAvailability,
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
  upload: (itemId: string, data: { file: File }) =>
    menuPhotoControllerUploadPhoto(itemId, data),
  getPhotos: menuPhotoControllerGetPhotos,
  delete: (itemId: string, photoId: string) =>
    menuPhotoControllerDeletePhoto(itemId, photoId),
  setPrimary: menuPhotoControllerSetPrimary,
  bulkUpload: menuPhotoControllerUploadPhotos,
  updateOrder: menuPhotoControllerUpdateOrder,
};

// Unified menu API
export const menuApi = {
  categories: menuCategoriesApi,
  items: menuItemsApi,
  modifiers: modifiersApi,
  photos: menuPhotosApi,
};
