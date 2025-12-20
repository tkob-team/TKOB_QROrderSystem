// Cart-related types

import { MenuItem } from './menu';

export interface CartItem {
  id: string; // unique cart item id
  menuItem: MenuItem;
  selectedSize?: string;
  selectedToppings: string[]; // topping ids
  specialInstructions?: string;
  quantity: number;
}
