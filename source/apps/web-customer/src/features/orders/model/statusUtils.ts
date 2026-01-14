/**
 * Order status utility functions
 * 
 * Provides helpers for:
 * - Determining if order is "live" (tracking mode) vs "history" (detail mode)
 * - Getting user-facing status messages
 * - Status-based UI decisions
 */

import type { Order } from '@/types/order';

/**
 * Determine if order is "live/current" (tracking mode) vs "history" (detail mode)
 * 
 * Live orders: Still in progress, not Completed/Cancelled
 * Used to determine which UI mode to show (tracking vs detail)
 */
export function isLiveOrder(order: Order): boolean {
  return order.status !== 'Completed' && order.status !== 'Cancelled';
}

/**
 * Get user-facing status message for order status
 * 
 * Provides contextual messages for each status stage
 */
export function getStatusMessage(status: string): string {
  switch (status) {
    case 'Pending':
      return 'Your order has been submitted and is awaiting confirmation.';
    case 'Accepted':
      return 'The restaurant has accepted your order and will begin preparing it soon.';
    case 'Preparing':
      return 'Your order is currently being prepared by the kitchen.';
    case 'Ready':
      return 'Your order is ready for pickup!';
    case 'Served':
      return 'Your order has been served to your table.';
    case 'Completed':
      return 'Your order has been completed. Enjoy your meal!';
    case 'Cancelled':
      return 'This order has been cancelled.';
    default:
      return 'Your order is in progress.';
  }
}

/**
 * Check if payment is required for order
 * 
 * Returns true if order is unpaid or payment failed
 */
export function isPaymentRequired(paymentStatus: string): boolean {
  return paymentStatus === 'Unpaid' || paymentStatus === 'Failed';
}

/**
 * Check if order should show estimated time
 * 
 * Returns true if order is not yet ready/completed
 */
export function shouldShowEstimatedTime(status: string): boolean {
  return status !== 'Ready' && status !== 'Completed' && status !== 'Served';
}
