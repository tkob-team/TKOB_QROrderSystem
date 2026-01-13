// Mock orders data
// CANONICAL STORAGE: All operations delegate to orderStorage.ts module

import { Order } from '@/types';
import { log } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { readOrders, writeOrders, getOrdersKey } from '@/features/orders/data/mocks/orderStorage';

// Store created orders here (in-memory compatibility layer)
export const mockOrders: Order[] = [];

// Current active order
export let mockCurrentOrder: Order | null = null;

// Helper to set current order
export function setMockCurrentOrder(order: Order | null) {
  mockCurrentOrder = order;
}

/**
 * Get localStorage key for orders
 * 
 * CANONICAL FORMAT: tkob_mock_orders:<tableId>
 * sessionId parameter is treated as tableId for backward compatibility
 * 
 * @param sessionId - table identifier (legacy name kept for compatibility)
 * @returns Canonical storage key
 */
export function getOrdersStorageKey(sessionId?: string): string {
  return getOrdersKey(sessionId || 'default');
}

/**
 * Load orders from localStorage for a table/session
 * 
 * Delegates to canonical orderStorage module
 * 
 * @param sessionId - table identifier (legacy name kept for compatibility)
 */
export function loadOrdersFromStorage(sessionId?: string): Order[] {
  return readOrders(sessionId || 'default');
}

/**
 * Save orders to localStorage for a table/session
 * 
 * Delegates to canonical orderStorage module
 * 
 * @param orders - Orders to save
 * @param sessionId - table identifier (legacy name kept for compatibility)
 */
export function saveOrdersToStorage(orders: Order[], sessionId?: string): void {
  writeOrders(sessionId || 'default', orders);
}

/**
 * Clear all orders from localStorage for a table/session
 * 
 * @param sessionId - table identifier (legacy name kept for compatibility)
 */
export function clearOrdersFromStorage(sessionId?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = getOrdersStorageKey(sessionId);
    window.localStorage.removeItem(key);
    
    if (process.env.NEXT_PUBLIC_USE_LOGGING) {
      log('mock', 'Cleared orders from localStorage', { storageKey: maskId(key) }, { feature: 'orders' });
    }
  } catch (err) {
    log('mock', 'Failed to clear orders from localStorage', { error: String(err) }, { feature: 'orders' });
  }
}
