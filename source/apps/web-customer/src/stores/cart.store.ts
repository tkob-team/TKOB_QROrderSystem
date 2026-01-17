// Cart store - manages shopping cart state with server sync

import { create } from 'zustand';
import { log, logError } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
// eslint-disable-next-line no-restricted-imports -- Legacy pattern, TODO: migrate to React Query
import { cartApi } from '@/features/cart/data/cart.service';
// eslint-disable-next-line no-restricted-imports -- Legacy pattern, TODO: migrate to React Query
import type { CartItemResponse, AddToCartRequest } from '@/features/cart/data/types';

interface CartState {
  // Data from server
  items: CartItemResponse[];
  subtotal: number;
  tax: number;
  taxRate: number;
  serviceCharge: number;
  serviceChargeRate: number;
  total: number;
  itemCount: number;
  
  // UI state
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  fetchCart: () => Promise<void>;
  addItem: (request: AddToCartRequest) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Helpers
  getItemCount: () => number;
  resetError: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  // Initial state
  items: [],
  subtotal: 0,
  tax: 0,
  taxRate: 0,
  serviceCharge: 0,
  serviceChargeRate: 0,
  total: 0,
  itemCount: 0,
  isLoading: false,
  isInitialized: false,
  error: null,
  
  /**
   * Fetch cart from server
   * Called on page load to sync with server state
   */
  fetchCart: async () => {
    // Skip if already loading
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const cart = await cartApi.getCart();
      
      // Debug log to check tax calculation
      console.log('Cart API Response:', {
        subtotal: cart.subtotal,
        tax: cart.tax,
        taxRate: cart.taxRate,
        serviceCharge: cart.serviceCharge,
        serviceChargeRate: cart.serviceChargeRate,
        total: cart.total,
      });
      
      set({
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        taxRate: cart.taxRate ?? 0,
        serviceCharge: cart.serviceCharge ?? 0,
        serviceChargeRate: cart.serviceChargeRate ?? 0,
        total: cart.total,
        itemCount: cart.itemCount,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      logError('data', 'Failed to fetch cart', error, { feature: 'cart' });
      set({ 
        isLoading: false, 
        isInitialized: true,
        error: error instanceof Error ? error.message : 'Failed to load cart'
      });
    }
  },
  
  /**
   * Add item to cart via API
   */
  addItem: async (request: AddToCartRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      log('ui', 'Adding item to cart', {
        menuItemId: maskId(request.menuItemId),
        quantity: request.quantity,
      }, { feature: 'cart' });
      
      const cart = await cartApi.addItem(request);
      
      // Debug log
      console.log('Cart after adding item:', {
        subtotal: cart.subtotal,
        tax: cart.tax,
        taxRate: cart.taxRate,
        total: cart.total,
      });
      
      set({
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        taxRate: cart.taxRate ?? 0,
        serviceCharge: cart.serviceCharge ?? 0,
        serviceChargeRate: cart.serviceChargeRate ?? 0,
        total: cart.total,
        itemCount: cart.itemCount,
        isLoading: false,
      });
      
      log('ui', 'Item added to cart', { 
        itemCount: cart.itemCount 
      }, { feature: 'cart' });
      
    } catch (error) {
      logError('ui', 'Failed to add item to cart', error, { feature: 'cart' });
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add item'
      });
      throw error; // Re-throw for UI to handle
    }
  },
  
  /**
   * Update item quantity via API
   */
  updateQuantity: async (itemId: string, quantity: number) => {
    // If quantity is 0 or less, remove the item
    if (quantity <= 0) {
      await get().removeItem(itemId);
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      log('ui', 'Updating cart quantity', { 
        itemId: maskId(itemId), 
        quantity 
      }, { feature: 'cart' });
      
      const cart = await cartApi.updateItem(itemId, { quantity });
      
      set({
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        taxRate: cart.taxRate ?? 0,
        serviceCharge: cart.serviceCharge ?? 0,
        serviceChargeRate: cart.serviceChargeRate ?? 0,
        total: cart.total,
        itemCount: cart.itemCount,
        isLoading: false,
      });
      
    } catch (error) {
      logError('ui', 'Failed to update cart quantity', error, { feature: 'cart' });
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update quantity'
      });
      throw error;
    }
  },
  
  /**
   * Remove item from cart via API
   */
  removeItem: async (itemId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      log('ui', 'Removing item from cart', { 
        itemId: maskId(itemId) 
      }, { feature: 'cart' });
      
      const cart = await cartApi.removeItem(itemId);
      
      set({
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        taxRate: cart.taxRate ?? 0,
        serviceCharge: cart.serviceCharge ?? 0,
        serviceChargeRate: cart.serviceChargeRate ?? 0,
        total: cart.total,
        itemCount: cart.itemCount,
        isLoading: false,
      });
      
      log('ui', 'Item removed from cart', { 
        itemCount: cart.itemCount 
      }, { feature: 'cart' });
      
    } catch (error) {
      logError('ui', 'Failed to remove item from cart', error, { feature: 'cart' });
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to remove item'
      });
      throw error;
    }
  },
  
  /**
   * Clear cart via API
   */
  clearCart: async () => {
    const itemCount = get().items.length;
    
    set({ isLoading: true, error: null });
    
    try {
      log('ui', 'Clearing cart', { itemCount }, { feature: 'cart' });
      
      await cartApi.clearCart();
      
      set({
        items: [],
        subtotal: 0,
        tax: 0,
        taxRate: 0,
        serviceCharge: 0,
        serviceChargeRate: 0,
        total: 0,
        itemCount: 0,
        isLoading: false,
      });
      
      log('ui', 'Cart cleared', {}, { feature: 'cart' });
      
    } catch (error) {
      logError('ui', 'Failed to clear cart', error, { feature: 'cart' });
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to clear cart'
      });
      throw error;
    }
  },
  
  /**
   * Get total item count
   */
  getItemCount: () => {
    return get().itemCount;
  },
  
  /**
   * Reset error state
   */
  resetError: () => {
    set({ error: null });
  },
}));
