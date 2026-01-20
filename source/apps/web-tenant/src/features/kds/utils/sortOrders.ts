/**
 * KDS Order Sorting Utilities
 * Sort orders by creation time ASC (oldest first) to process in order received
 */

import type { KdsOrder } from '../model/types';

export const sortOrdersByStatus = {
  /**
   * Sort pending orders by creation time ascending (oldest first - FIFO)
   */
  pending: (orders: KdsOrder[]): KdsOrder[] => {
    return [...orders]
      .filter((order) => order.status === 'pending')
      .sort((a, b) => {
        // Sort by createdAt ASC (oldest first)
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // Fallback to elapsed time ASC (higher time = older = first)
        return b.time - a.time;
      });
  },

  /**
   * Sort preparing orders: overdue first, then by creation time ascending (oldest first)
   */
  preparing: (orders: KdsOrder[]): KdsOrder[] => {
    return [...orders]
      .filter((order) => order.status === 'preparing')
      .sort((a, b) => {
        // Overdue orders first
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        // Then by createdAt ASC (oldest first)
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // Fallback to elapsed time ASC
        return b.time - a.time;
      });
  },

  /**
   * Sort ready orders by creation time ascending (oldest first - serve in order)
   */
  ready: (orders: KdsOrder[]): KdsOrder[] => {
    return [...orders]
      .filter((order) => order.status === 'ready')
      .sort((a, b) => {
        // Sort by createdAt ASC (oldest first)
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // Fallback to elapsed time ASC
        return b.time - a.time;
      });
  },
};
