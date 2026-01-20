// Menu and menu item related types

export interface PhotoDto {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ModifierOptionDto {
  id: string;
  name: string;
  priceDelta: number;
  displayOrder: number;
  active: boolean;
}

export interface ModifierGroupDto {
  id: string;
  name: string;
  description?: string;
  type: string;
  required: boolean;
  minChoices: number;
  maxChoices: number;
  displayOrder: number;
  active: boolean;
  options: ModifierOptionDto[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl: string;
  primaryPhoto?: PhotoDto;
  photos?: PhotoDto[];
  modifierGroups?: ModifierGroupDto[];
  preparationTime?: number;
  chefRecommended?: boolean;
  popularity?: number;
  dietary?: ('Vegan' | 'Vegetarian' | 'Spicy' | 'Gluten-Free')[];
  availability?: 'Available' | 'Sold out' | 'Unavailable';
  badge?: 'Chef\'s recommendation' | 'Popular';
  sizes?: MenuItemSize[];
  toppings?: MenuItemTopping[];
  reviews?: Review[];
  // Rating stats from reviews
  averageRating?: number;
  totalReviews?: number;
}

export interface MenuItemSize {
  size: string;
  price: number;
}

export interface MenuItemTopping {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
}
