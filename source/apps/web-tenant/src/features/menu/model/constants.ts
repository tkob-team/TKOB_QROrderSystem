/**
 * Menu Management Feature - Constants
 * 
 * Shared constants for menu management
 */

import type { MenuItemFormData, SortOption, DietaryTag, Allergen, MenuItemStatus } from './types';

/**
 * Initial form data for menu item
 */
export const INITIAL_MENU_ITEM_FORM: MenuItemFormData = {
  name: '',
  categoryId: '',                  // Renamed
  description: '',
  price: 0,                        // Changed to number
  status: 'DRAFT',                 // Default to DRAFT
  available: true,                 // Default to available
  preparationTime: 0,              // Default 0 minutes
  allergens: [],                   // Empty array
  dietary: [],
  chefRecommended: false,
  displayOrder: 0,                 // Default to 0
  photos: [],                      // Empty array for multiple photos
  modifierGroupIds: [],
  photosToDelete: [],              // Track photos to delete
};

/**
 * Status filter options
 */
export const STATUS_FILTER_OPTIONS = [
  'All Status',
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
];

/**
 * Sort options
 */
export const SORT_OPTIONS: SortOption[] = [
  'Sort by: Newest',
  'Popularity',
  'Price (Low)',
  'Price (High)',
];

/**
 * Archive status options
 */
export const ARCHIVE_STATUS_OPTIONS = [
  { value: 'all', label: 'Active Items' },
  { value: 'archived', label: 'Archived Items' },
];

/**
 * Dietary tag options
 */
export const DIETARY_TAG_OPTIONS: { value: DietaryTag; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'halal', label: 'Halal' },
];

/**
 * Common allergens for selection
 */
export const ALLERGEN_OPTIONS: { value: Allergen; label: string }[] = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'nuts', label: 'Nuts' },
  { value: 'soy', label: 'Soy' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'fish', label: 'Fish' },
  { value: 'sesame', label: 'Sesame' },
];

/**
 * Status options for menu items (API values)
 */
export const STATUS_OPTIONS: { value: MenuItemStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

/**
 * Status labels mapping
 */
export const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  unavailable: 'Unavailable',
  sold_out: 'Sold out',
  archived: 'Archived',
};

/**
 * Max file size for image upload (5MB)
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Accepted image formats
 */
export const ACCEPTED_IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
