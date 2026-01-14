/**
 * Centralized React Query keys for order-related queries
 * 
 * Ensures consistent cache invalidation across the app.
 * All order query keys should be defined here.
 */

export const orderQueryKeys = {
  /**
   * Single order detail by ID
   */
  order: (orderId: string) => ['order', orderId] as const,

  /**
   * List of orders for a specific table
   */
  orders: (tableId: string) => ['orders', tableId] as const,

  /**
   * Current order for a session (legacy)
   */
  currentOrder: (sessionId: string) => ['currentOrder', sessionId] as const,

  /**
   * Order history for a session (legacy)
   */
  orderHistory: (sessionId: string) => ['orderHistory', sessionId] as const,

  /**
   * All order-related queries
   */
  all: () => ['orders'] as const,
};
