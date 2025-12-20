// Cart store - manages shopping cart state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '@/types';
import { generateId } from '@/lib/utils';

interface CartStore {
  items: CartItem[];
  addItem: (data: {
    menuItem: MenuItem;
    selectedSize?: string;
    selectedToppings: string[];
    specialInstructions?: string;
    quantity: number;
  }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, data: Partial<CartItem>) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (data) => {
        const cartItem: CartItem = {
          id: generateId('cart'),
          menuItem: data.menuItem,
          selectedSize: data.selectedSize,
          selectedToppings: data.selectedToppings,
          specialInstructions: data.specialInstructions,
          quantity: data.quantity,
        };
        
        set((state) => ({
          items: [...state.items, cartItem],
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateItem: (id, data) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
