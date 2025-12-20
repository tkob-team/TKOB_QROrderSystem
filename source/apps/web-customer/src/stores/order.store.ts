// Order store - manages order state and history

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '@/types';

interface OrderStore {
  currentOrder: Order | null;
  orderHistory: Order[];
  setCurrentOrder: (order: Order | null) => void;
  addToHistory: (order: Order) => void;
  clearHistory: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      currentOrder: null,
      orderHistory: [],
      
      setCurrentOrder: (order) => set({ currentOrder: order }),
      
      addToHistory: (order) =>
        set((state) => ({
          orderHistory: [order, ...state.orderHistory],
        })),
      
      clearHistory: () => set({ orderHistory: [] }),
    }),
    {
      name: 'order-storage',
    }
  )
);
