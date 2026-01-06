/**
 * Menu Management Feature - Constants
 * 
 * Shared constants for menu management
 */

import type { MenuItemFormData, SortOption, DietaryTag } from './types';

/**
 * Initial form data for menu item
 */
export const INITIAL_MENU_ITEM_FORM: MenuItemFormData = {
  name: '',
  category: '',
  description: '',
  price: '',
  status: 'available',
  image: null,
  dietary: [],
  chefRecommended: false,
  modifierGroupIds: [],
};

/**
 * Status filter options
 */
export const STATUS_FILTER_OPTIONS = [
  'All Status',
  'Available',
  'Unavailable',
  'Sold Out',
];

/**
 * Sort options
 */
export const SORT_OPTIONS: SortOption[] = [
  'Sort by: Newest',
  'Sort by: Popularity',
  'Sort by: Price (Low)',
  'Sort by: Price (High)',
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
