// Cart API Service - calls backend cart endpoints

import apiClient from '@/api/client';
import { log, logError } from '@/shared/logging/logger';
import type { CartResponse, AddToCartRequest, UpdateCartItemRequest } from './types';

/**
 * Cart API Service
 * 
 * All cart operations are session-based (uses HttpOnly cookie)
 * Backend associates cart with table session automatically
 */
export class CartApiService {
  private static instance: CartApiService;

  static getInstance(): CartApiService {
    if (!this.instance) {
      this.instance = new CartApiService();
    }
    return this.instance;
  }

  /**
   * Get current cart for table session
   * Called on page load to sync with server state
   */
  async getCart(): Promise<CartResponse> {
    try {
      log('data', 'Fetching cart from server', {}, { feature: 'cart' });
      const response = await apiClient.get<{ success: boolean; data: CartResponse }>('/cart');
      log('data', 'Cart fetched', { itemCount: response.data.data.itemCount }, { feature: 'cart' });
      return response.data.data;
    } catch (error) {
      logError('data', 'Failed to fetch cart', error, { feature: 'cart' });
      // Return empty cart on error (session might not exist yet)
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      };
    }
  }

  /**
   * Add item to cart
   * Creates cart if doesn't exist (backend handles this)
   */
  async addItem(request: AddToCartRequest): Promise<CartResponse> {
    log('data', 'Adding item to cart', { menuItemId: request.menuItemId, quantity: request.quantity }, { feature: 'cart' });
    
    const response = await apiClient.post<{ success: boolean; data: CartResponse }>('/cart/items', request);
    
    log('data', 'Item added to cart', { itemCount: response.data.data.itemCount }, { feature: 'cart' });
    return response.data.data;
  }

  /**
   * Update cart item quantity
   * If quantity = 0, item will be removed (backend handles this)
   */
  async updateItem(itemId: string, request: UpdateCartItemRequest): Promise<CartResponse> {
    log('data', 'Updating cart item', { itemId, quantity: request.quantity }, { feature: 'cart' });
    
    const response = await apiClient.patch<{ success: boolean; data: CartResponse }>(`/cart/items/${itemId}`, request);
    
    log('data', 'Cart item updated', { itemCount: response.data.data.itemCount }, { feature: 'cart' });
    return response.data.data;
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<CartResponse> {
    log('data', 'Removing cart item', { itemId }, { feature: 'cart' });
    
    const response = await apiClient.delete<{ success: boolean; data: CartResponse }>(`/cart/items/${itemId}`);
    
    log('data', 'Cart item removed', { itemCount: response.data.data.itemCount }, { feature: 'cart' });
    return response.data.data;
  }

  /**
   * Clear all items from cart
   */
  async clearCart(): Promise<void> {
    log('data', 'Clearing cart', {}, { feature: 'cart' });
    
    await apiClient.delete('/cart');
    
    log('data', 'Cart cleared', {}, { feature: 'cart' });
  }
}

// Export singleton instance
export const cartApi = CartApiService.getInstance();
