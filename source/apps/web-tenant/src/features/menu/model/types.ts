/**
 * Menu Management Feature - Type Definitions
 * 
 * Centralized type definitions for menu items and categories
 */

/**
 * Menu item status
 * Frontend: available | unavailable | sold_out | archived
 * Backend: SOLD_OUT | AVAILABLE | ARCHIVED
 */
export type MenuItemStatus = 'available' | 'unavailable' | 'sold_out' | 'archived' | 'SOLD_OUT' | 'AVAILABLE' | 'ARCHIVED';

/**
 * Dietary tags
 */
export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'spicy' | 'halal';

/**
 * Category entity
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Modifier group (from menu-modifiers feature)
 */
export interface ModifierGroup {
  id: string;
  name: string;
  minSelect?: number;
  maxSelect?: number;
  required?: boolean;
}

/**
 * Menu item entity
 */
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  status: MenuItemStatus;
  isAvailable: boolean;
  dietary?: DietaryTag[];
  chefRecommended?: boolean;
  popularity?: number;
  imageUrl?: string;
  photoId?: string;
  modifierGroups?: ModifierGroup[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Menu item form data (for create/edit)
 */
export interface MenuItemFormData {
  name: string;
  category: string;
  description: string;
  price: string;
  status: MenuItemStatus;
  image: File | null;
  dietary: DietaryTag[];
  chefRecommended: boolean;
  modifierGroupIds?: string[];
}

/**
 * Menu filters
 */
export interface MenuFilters {
  categoryId: string; // 'all' or category ID
  status: string; // 'All Status' | 'Available' | 'Unavailable' | 'Sold Out'
  archiveStatus: 'all' | 'archived';
  sortBy: SortOption;
  searchQuery: string;
}

/**
 * Sort options
 */
export type SortOption = 
  | 'Sort by: Newest'
  | 'Popularity'
  | 'Price (Low)'
  | 'Price (High)';

/**
 * Toast type
 */
export type ToastType = 'success' | 'error';

/**
 * Modal mode
 */
export type ModalMode = 'add' | 'edit';
