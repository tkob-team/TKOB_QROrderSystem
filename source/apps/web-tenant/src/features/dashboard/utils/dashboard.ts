/**
 * Dashboard Utility Functions
 * Pure helper functions for data transformation and formatting
 */

import type { OrderStatus, OrderStatusData, MockOrder } from '../model/types';
import { logger } from '@/shared/utils/logger';

/**
 * Count orders by status
 */
export function getOrderCountByStatus(
  orders: MockOrder[]
): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = {
    placed: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    served: 0,
    completed: 0,
    cancelled: 0,
  };

  orders.forEach((order) => {
    counts[order.status as OrderStatus]++;
  });

  return counts;
}

/**
 * Get badge variant for order status
 */
export function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'info' | 'primary' | 'default' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'preparing':
      return 'warning';
    case 'ready':
      return 'info';
    case 'placed':
      return 'primary';
    default:
      // INVARIANT: Unexpected order status value
      if (typeof window !== 'undefined') {
        logger.warn('[invariant] UNEXPECTED_ORDER_STATUS', {
          receivedStatus: status,
          validStatuses: ['placed', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
        });
      }
      return 'default';
  }
}

/**
 * Format orders by status for chart display
 */
export function formatOrdersForChart(orders: MockOrder[]): OrderStatusData[] {
  const statusCounts = getOrderCountByStatus(orders);

  return [
    { name: 'Placed', value: statusCounts.placed, color: '#3b82f6' },
    { name: 'Confirmed', value: statusCounts.confirmed, color: '#6b8e23' },
    { name: 'Preparing', value: statusCounts.preparing, color: '#f59e0b' },
    { name: 'Ready', value: statusCounts.ready, color: '#22c55e' },
    { name: 'Completed', value: statusCounts.completed, color: '#87877f' },
  ];
}
