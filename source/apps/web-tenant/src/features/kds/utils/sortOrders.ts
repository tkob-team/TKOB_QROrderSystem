/**
 * KDS Order Sorting Utilities
 */

import type { KdsOrder } from '../model/types';

export const sortOrdersByStatus = {
  /**
   * Sort pending orders by time descending (newer orders first)
   */
  pending: (orders: KdsOrder[]): KdsOrder[] => {
    return [...orders]
      .filter((order) => order.status === 'pending')
      .sort((a, b) => b.time - a.time);
  },

  /**
   * Sort preparing orders: overdue first, then by time descending
   */
  preparing: (orders: KdsOrder[]): KdsOrder[] => {
    return [...orders]
      .filter((order) => order.status === 'preparing')
      .sort((a, b) => {
        // Overdue orders first
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        // Then by time DESC
        return b.time - a.time;
      });
  },

  /**
   * Sort ready orders by time descending (newer orders first)
   */
  ready: (orders: KdsOrder[]): KdsOrder[] => {
    return [...orders]
      .filter((order) => order.status === 'ready')
      .sort((a, b) => b.time - a.time);
  },
};
