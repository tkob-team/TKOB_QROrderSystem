/**
 * Menu Management Feature - Type Definitions
 * 
 * Centralized type definitions for menu items and categories
 */

/**
 * Menu item publication status (API: DRAFT | PUBLISHED | ARCHIVED)
 * Separate from availability (in stock/out of stock)
 */
export type MenuItemStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

/**
 * Common allergens for menu items
 */
export type Allergen = 'gluten' | 'dairy' | 'eggs' | 'nuts' | 'soy' | 'shellfish' | 'fish' | 'sesame';

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
  displayOrder: number;
  active: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
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
  preparationTime?: number;          // 0-240 minutes
  allergens?: Allergen[];            // Allergen array
  dietary?: DietaryTag[];
  chefRecommended?: boolean;
  popularity?: number;
  imageUrl?: string;
  photoId?: string;
  displayOrder?: number;             // Sort order within category
  modifierGroups?: ModifierGroup[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Menu item photo for upload/display
 */
export interface MenuItemPhoto {
  id?: string;                     // For existing photos
  file?: File;                     // For new uploads
  name: string;
  size: number;
  isPrimary: boolean;
  displayOrder?: number;           // Photo order (lower = earlier)
  url?: string;                    // Photo URL (from API response)
  filename?: string;               // Original filename (from API)
  mimeType?: string;               // Image MIME type (from API)
  createdAt?: string;              // Creation time (from API)
}

/**
 * Menu item form data (for create/edit)
 */
export interface MenuItemFormData {
  name: string;
  categoryId: string;              // Renamed from 'category'
  description: string;
  price: number;                   // Changed from string to number
  status: MenuItemStatus;          // DRAFT | PUBLISHED | ARCHIVED
  available: boolean;              // Stock availability (separate from status)
  preparationTime: number;         // 0-240 minutes
  allergens: Allergen[];           // Allergen information
  dietary: DietaryTag[];           // Dietary tags (maps to API tags[])
  chefRecommended: boolean;
  displayOrder: number;            // Sort order within category
  photos: MenuItemPhoto[];          // Multiple photos with primary flag
  modifierGroupIds?: string[];
  photosToDelete?: string[];       // Track photo IDs marked for deletion
}

/**
 * Menu filters
 */
export interface MenuFilters {
  categoryId: string; // 'all' or category ID
  status: string; // 'All Status' | 'Draft' | 'Published' | 'Archived'
  sortBy: SortOption;
  searchQuery: string;
  availability?: 'all' | 'available' | 'unavailable'; // Filter by item availability
  chefRecommended?: boolean; // Filter by chef recommended items
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
 * HELPER FUNCTIONS
 */

/**
 * Sort photos by isPrimary (descending) then by displayOrder (ascending)
 * Priority: isPrimary first, then displayOrder
 * @param photos - Array of photos to sort
 * @returns Sorted photos array
 */
export function sortPhotos(photos: MenuItemPhoto[] | undefined): MenuItemPhoto[] {
  if (!photos || photos.length === 0) return [];
  
  return [...photos].sort((a, b) => {
    // Primary photos first (isPrimary: true comes before false)
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    
    // Then by displayOrder ascending (0, 1, 2...)
    const displayOrderA = a.displayOrder ?? 0;
    const displayOrderB = b.displayOrder ?? 0;
    return displayOrderA - displayOrderB;
  });
}

/**
 * Get the primary photo URL from a menu item
 * Falls back: primary photo → first photo → imageUrl → undefined
 * @param item - Menu item to extract photo from
 * @returns Photo URL or undefined
 */
export function getPrimaryPhotoUrl(item: MenuItem & { photos?: MenuItemPhoto[] }): string | undefined {
  // First try to get primary photo from photos array
  if (item.photos && item.photos.length > 0) {
    const sortedPhotos = sortPhotos(item.photos);
    return sortedPhotos[0]?.url;
  }
  
  // Fallback to imageUrl field
  return item.imageUrl;
}
/**
 * Modal mode
 */
export type ModalMode = 'add' | 'edit';
