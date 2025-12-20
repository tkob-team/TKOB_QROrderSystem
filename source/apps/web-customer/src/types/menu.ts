// Menu and menu item related types

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl: string;
  dietary?: ('Vegan' | 'Vegetarian' | 'Spicy' | 'Gluten-Free')[];
  availability?: 'Available' | 'Sold out' | 'Unavailable';
  badge?: 'Chef\'s recommendation' | 'Popular';
  sizes?: MenuItemSize[];
  toppings?: MenuItemTopping[];
  reviews?: Review[];
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
