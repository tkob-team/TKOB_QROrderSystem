/**
 * Order Sorting Utilities
 * Pure functions for sorting service orders
 */

import type { ServiceOrder, OrderStatus } from '../model/types';

/**
 * Sort orders by status
 * - Completed: newest first (smallest minutesAgo)
 * - All others: oldest first (highest minutesAgo)
 */
export const sortOrdersByStatus = (orders: ServiceOrder[], status: OrderStatus): ServiceOrder[] => {
  const filtered = orders.filter((order) => order.status === status);
  
  if (status === 'completed') {
    return [...filtered].sort((a, b) => a.minutesAgo - b.minutesAgo);
  }
  
  return [...filtered].sort((a, b) => b.minutesAgo - a.minutesAgo);
};
