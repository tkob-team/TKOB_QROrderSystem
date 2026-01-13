// Legacy UI types kept for backward compatibility with MenuItemModal
// These are not React hooks and exist solely to preserve older prop shapes.

export type ItemFormData = {
  name: string;
  category: string;
  description: string;
  price: string;
  prepTimeMinutes: number | null;
  displayOrder?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  available: boolean;
  dietary: string[];
  allergens: string[];
  chefRecommended: boolean;
  modifierGroupIds?: string[];
};

export type PhotoState = {
  localId: string;
  previewUrl?: string;
  url?: string;
  file?: File;
  isPrimary: boolean;
};
