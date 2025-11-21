'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// TODO: Import from @packages/dto when available
export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  modifiers?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  specialInstructions?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.menuItemId === item.menuItemId
          );

          if (existingItemIndex >= 0) {
            // Item already exists, update quantity
            const newItems = [...state.items];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + (item.quantity || 1),
            };
            return { items: newItems };
          } else {
            // New item, add to cart
            return {
              items: [
                ...state.items,
                {
                  ...item,
                  quantity: item.quantity || 1,
                },
              ],
            };
          }
        }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return { items: state.items.filter((i) => i.id !== itemId) };
          }

          return {
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          };
        }),

      updateItem: (itemId, updates) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, ...updates } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          const basePrice = item.price * item.quantity;
          const modifiersPrice = (item.modifiers || []).reduce(
            (sum, mod) => sum + mod.price,
            0
          ) * item.quantity;
          return total + basePrice + modifiersPrice;
        }, 0);
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      // Only persist on client side
      skipHydration: typeof window === 'undefined',
    }
  )
);
