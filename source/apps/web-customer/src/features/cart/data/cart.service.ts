/**
 * Cart API Service
 * Uses Orval-generated API functions for type-safe cart operations
 * 
 * Architecture (Refactored):
 * - Uses generated functions from @/services/generated/cart
 * - Type-safe with auto-generated TypeScript types
 * - Auto-sync with backend API changes
 * 
 * All cart operations are session-based (uses HttpOnly cookie)
 * Backend associates cart with table session automatically
 */

import {
  cartControllerGetCart,
  cartControllerAddToCart,
  cartControllerUpdateCartItem,
  cartControllerRemoveCartItem,
  cartControllerClearCart,
} from '@/services/generated/cart/cart';

import { log, logError } from '@/shared/logging/logger';
import type { CartResponse, CartItemResponse, AddToCartRequest, UpdateCartItemRequest } from './types';

import type { CartResponseDto } from '@/services/generated/models';

/**
 * Helper to map generated CartResponseDto to local CartResponse type
 */
function mapCartResponse(cart: CartResponseDto): CartResponse {
  return {
    items: cart.items as unknown as CartItemResponse[],
    subtotal: cart.subtotal,
    tax: cart.tax,
    total: cart.total,
    itemCount: cart.itemCount,
    taxRate: 0,
    serviceCharge: 0,
    serviceChargeRate: 0,
  };
}

/**
 * Cart API Service
 * Singleton wrapper around generated cart API functions
 */
export class CartApiService {
  private static instance: CartApiService;

  static getInstance(): CartApiService {
    if (!this.instance) {
      this.instance = new CartApiService();
    }
    return this.instance;
  }

  async getCart(): Promise<CartResponse> {
    try {
      log('data', 'Fetching cart from server', {}, { feature: 'cart' });
      
      const cart = await cartControllerGetCart();
      
      log('data', 'Cart fetched', { itemCount: cart.itemCount }, { feature: 'cart' });
      return mapCartResponse(cart);
    } catch (error) {
      logError('data', 'Failed to fetch cart', error, { feature: 'cart' });
      // Return empty cart on error (session might not exist yet)
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        taxRate: 0,
        serviceCharge: 0,
        serviceChargeRate: 0,
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
    log('data', 'Adding item to cart', { 
      menuItemId: request.menuItemId, 
      quantity: request.quantity 
    }, { feature: 'cart' });
    
    const cart = await cartControllerAddToCart(request);
    
    log('data', 'Item added to cart', { itemCount: cart.itemCount }, { feature: 'cart' });
    return mapCartResponse(cart);
  }

  /**
   * Update cart item quantity
   * If quantity = 0, item will be removed (backend handles this)
   */
  async updateItem(itemId: string, request: UpdateCartItemRequest): Promise<CartResponse> {
    log('data', 'Updating cart item', { itemId, quantity: request.quantity }, { feature: 'cart' });
    
    const cart = await cartControllerUpdateCartItem(itemId, request);
    
    log('data', 'Cart item updated', { itemCount: cart.itemCount }, { feature: 'cart' });
    return mapCartResponse(cart);
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<CartResponse> {
    log('data', 'Removing cart item', { itemId }, { feature: 'cart' });
    
    const cart = await cartControllerRemoveCartItem(itemId);
    
    log('data', 'Cart item removed', { itemCount: cart.itemCount }, { feature: 'cart' });
    return mapCartResponse(cart);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(): Promise<void> {
    log('data', 'Clearing cart', {}, { feature: 'cart' });
    
    await cartControllerClearCart();
    
    log('data', 'Cart cleared', {}, { feature: 'cart' });
  }
}

// Export singleton instance
export const cartApi = CartApiService.getInstance();
