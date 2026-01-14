/**
 * Canonical Order Storage Module
 * 
 * Single source of truth for all order persistence operations.
 * Guarantees deterministic behavior through:
 * - Unified storage key format (tkob_mock_orders:<tableId>)
 * - Normalized enum values (Paid, Unpaid, Failed)
 * - Centralized read/write operations
 * - No silent failures
 * 
 * All reads/writes to localStorage for orders MUST go through this module.
 */

import { Order } from '@/types/order';
import { log, logError } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { debugOrder } from '../../dev/orderDebug';

// Canonical payment status enum (matches Order type definition)
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Failed';

/**
 * Generate canonical storage key for a table
 * 
 * Format: tkob_mock_orders:<tableId>
 * 
 * @param tableId - Unique table identifier (e.g., "table-12", "Table_3")
 * @returns Canonical storage key
 * @throws Error if tableId is empty or falsy
 */
export function getOrdersKey(tableId: string): string {
  if (!tableId || typeof tableId !== 'string') {
    throw new Error('[OrderStorage] Invalid tableId: must be non-empty string');
  }
  
  const key = `tkob_mock_orders:${tableId}`;
  
  log('data', 'Storage key generated', { tableId: maskId(tableId) }, { feature: 'orders', dedupe: true, dedupeTtlMs: 10000 });
  
  return key;
}

/**
 * Read orders from storage for a table
 * 
 * @param tableId - Table identifier
 * @returns Array of orders (empty array if not found or SSR)
 */
export function readOrders(tableId: string): Order[] {
  if (typeof window === 'undefined') {
    // SSR environment - no localStorage access
    return [];
  }

  try {
    const key = getOrdersKey(tableId);
    const stored = window.localStorage.getItem(key);
    
    if (stored) {
      const orders = JSON.parse(stored) as Order[];
      
      log('data', 'Orders read from storage', { count: orders.length, hasOrders: true }, { feature: 'orders', dedupe: true, dedupeTtlMs: 5000 });
      
      return orders;
    }
    
    log('data', 'Orders read from storage', { count: 0, hasOrders: false }, { feature: 'orders', dedupe: true, dedupeTtlMs: 5000 });
    
    return [];
  } catch (err) {
    debugOrder('storage-error', {
      operation: 'readOrders',
      tableId,
      error: String(err),
      callsite: 'orderStorage.readOrders',
    });
    
    logError('data', 'Failed to read orders from storage', err, { feature: 'orders' });
    throw err; // Don't silently fail
  }
}

/**
 * Write orders to storage for a table
 * 
 * @param tableId - Table identifier
 * @param orders - Array of orders to persist
 * @throws Error if write fails
 */
export function writeOrders(tableId: string, orders: Order[]): void {
  if (typeof window === 'undefined') {
    // SSR environment - skip
    return;
  }

  try {
    const key = getOrdersKey(tableId);
    const serialized = JSON.stringify(orders);
    
    // Check for quota issues (basic prevention)
    if (serialized.length > 5000000) {
      logError('data', 'Storage payload exceeds 5MB, truncating', { originalCount: orders.length, keptCount: 20 }, { feature: 'orders' });
      const recentOrders = orders.slice(-20);
      window.localStorage.setItem(key, JSON.stringify(recentOrders));
      return;
    }
    
    window.localStorage.setItem(key, serialized);
    
    log('data', 'Orders written to storage', { count: orders.length }, { feature: 'orders', dedupe: true, dedupeTtlMs: 5000 });
  } catch (err) {
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      logError('data', 'localStorage quota exceeded', err, { feature: 'orders' });
      throw new Error('Storage quota exceeded - unable to save orders');
    }
    
    // Safety net: always log to console
    console.error('[OrderStorage] Failed to write orders:', err);
    
    // Structured logging for other write errors (gated, won't crash if logger has issues)
    if (process.env.NEXT_PUBLIC_USE_LOGGING) {
      try {
        logError('data', 'Storage write failed', err instanceof Error ? err : new Error(String(err)), {
          feature: 'orders'
        })
      } catch {
        // Silent fail - console.error above is our safety net
      }
    }
    throw err; // Don't silently fail
  }
}

/**
 * Insert or update a single order in storage
 * 
 * Reads current orders, updates/inserts the order, and writes back.
 * Maintains immutability of storage operations.
 * 
 * @param tableId - Table identifier
 * @param order - Order to insert or update
 * @throws Error if operation fails
 */
export function upsertOrder(tableId: string, order: Order): void {
  try {
    const orders = readOrders(tableId);
    const existingIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingIndex >= 0) {
      // Update existing
      orders[existingIndex] = order;
      log('data', 'Order upserted', { orderId: maskId(order.id), isUpdate: true }, { feature: 'orders' });
    } else {
      // Insert new
      orders.push(order);
      log('data', 'Order upserted', { orderId: maskId(order.id), isUpdate: false }, { feature: 'orders' });
    }
    
    writeOrders(tableId, orders);
  } catch (err) {
    logError('data', 'Failed to upsert order', err, { feature: 'orders' });
    throw err;
  }
}

/**
 * Update payment status of an order
 * 
 * Normalizes payment status to canonical enum values.
 * Reads order, updates status, writes back.
 * 
 * @param tableId - Table identifier
 * @param orderId - Order ID to update
 * @param status - New payment status (normalized to Paid | Unpaid | Failed)
 * @returns Updated order, or null if not found
 * @throws Error if operation fails
 */
export function updateOrderPaymentStatus(
  tableId: string,
  orderId: string,
  status: 'PAID' | 'UNPAID' | 'PENDING' | 'Paid' | 'Unpaid' | 'Failed'
): Order | null {
  try {
    const orders = readOrders(tableId);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      debugOrder('payment-status-update-failed', {
        tableId,
        orderId,
        reason: 'Order not found',
        requestedStatus: status,
        storageKey: `tkob_mock_orders:${tableId}`,
        callsite: 'orderStorage.updateOrderPaymentStatus',
      });
      
      log('data', 'Payment status update failed', { reason: 'Order not found' }, { feature: 'orders' });
      return null;
    }
    
    // Normalize status to canonical enum
    let normalizedStatus: PaymentStatus;
    switch (status.toUpperCase()) {
      case 'PAID':
        normalizedStatus = 'Paid';
        break;
      case 'UNPAID':
      case 'PENDING':
        normalizedStatus = 'Unpaid';
        break;
      case 'FAILED':
        normalizedStatus = 'Failed';
        break;
      default:
        throw new Error(`[OrderStorage] Invalid payment status: ${status}`);
    }
    
    // Update order
    const updatedOrder = {
      ...orders[orderIndex],
      paymentStatus: normalizedStatus,
    };
    orders[orderIndex] = updatedOrder;
    
    // Write back
    writeOrders(tableId, orders);
    
    // Log structured payment status update
    debugOrder('payment-status-update', {
      tableId,
      orderId,
      paymentStatus: normalizedStatus,
      normalizedFrom: status,
      storageKey: `tkob_mock_orders:${tableId}`,
      callsite: 'orderStorage.updateOrderPaymentStatus',
    });
    
    log('data', 'Payment status updated', { statusTransition: `${status} -> ${normalizedStatus}` }, { feature: 'orders' });
    
    return updatedOrder;
  } catch (err) {
    debugOrder('storage-error', {
      operation: 'updateOrderPaymentStatus',
      tableId,
      orderId,
      error: String(err),
      callsite: 'orderStorage.updateOrderPaymentStatus',
    });
    
    logError('data', 'Failed to update payment status', err, { feature: 'orders' });
    throw err;
  }
}

/**
 * Delete all orders for a table
 * 
 * @param tableId - Table identifier
 * @throws Error if operation fails
 */
export function clearOrders(tableId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const key = getOrdersKey(tableId);
    window.localStorage.removeItem(key);
    
    log('data', 'Orders cleared from storage', { tableId: maskId(tableId) }, { feature: 'orders' });
  } catch (err) {
    logError('data', 'Failed to clear orders', err, { feature: 'orders' });
    throw err;
  }
}

/**
 * Get single order by ID from storage
 * 
 * @param tableId - Table identifier
 * @param orderId - Order ID to find
 * @returns Order if found, null otherwise
 * @throws Error if read fails
 */
export function getOrder(tableId: string, orderId: string): Order | null {
  try {
    const orders = readOrders(tableId);
    const order = orders.find(o => o.id === orderId);
    return order || null;
  } catch (err) {
    logError('data', 'Failed to get order', err, { feature: 'orders' });
    throw err;
  }
}
