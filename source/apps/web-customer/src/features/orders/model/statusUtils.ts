/**
 * Order status utility functions
 * 
 * Provides helpers for:
 * - Determining if order is "live" (tracking mode) vs "history" (detail mode)
 * - Getting user-facing status messages
 * - Status-based UI decisions
 * 
 * NOTE: Backend returns UPPERCASE statuses (PENDING, RECEIVED, etc.)
 * Some legacy code may still use Title Case (Pending, Accepted, etc.)
 * These utilities normalize both formats.
 */

import type { Order } from '@/types/order';

/**
 * Normalize status to UPPERCASE for consistent comparison
 */
function normalizeStatus(status: string): string {
  // Map Title Case to UPPERCASE for backward compatibility
  const mappings: Record<string, string> = {
    'Pending': 'PENDING',
    'Accepted': 'RECEIVED',
    'Preparing': 'PREPARING',
    'Ready': 'READY',
    'Served': 'SERVED',
    'Completed': 'COMPLETED',
    'Cancelled': 'CANCELLED',
  };
  return mappings[status] || status.toUpperCase();
}

/**
 * Determine if order is "live/current" (tracking mode) vs "history" (detail mode)
 * 
 * Live orders: Still in progress, not Completed/Cancelled
 * Used to determine which UI mode to show (tracking vs detail)
 */
export function isLiveOrder(order: Order): boolean {
  const normalized = normalizeStatus(order.status);
  return normalized !== 'COMPLETED' && normalized !== 'CANCELLED';
}

/**
 * Get user-facing status message for order status
 * 
 * Provides contextual messages for each status stage
 */
export function getStatusMessage(status: string): string {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'PENDING':
      return 'Your order has been submitted and is awaiting confirmation.';
    case 'RECEIVED':
      return 'The restaurant has accepted your order and will begin preparing it soon.';
    case 'PREPARING':
      return 'Your order is currently being prepared by the kitchen.';
    case 'READY':
      return 'Your order is ready for pickup!';
    case 'SERVED':
      return 'Your order has been served to your table.';
    case 'COMPLETED':
      return 'Your order has been completed. Enjoy your meal!';
    case 'CANCELLED':
      return 'This order has been cancelled.';
    default:
      return 'Your order is in progress.';
  }
}

/**
 * Check if payment is required for order
 * 
 * Returns true if order is unpaid or payment failed
 * Handles both UPPERCASE (PENDING) and Title Case (Unpaid) formats
 */
export function isPaymentRequired(paymentStatus: string): boolean {
  const normalized = paymentStatus.toUpperCase();
  return normalized === 'PENDING' || normalized === 'UNPAID' || normalized === 'FAILED';
}

/**
 * Check if order is paid
 * 
 * Returns true if order is paid/completed
 * Handles both UPPERCASE (COMPLETED) and Title Case (Paid) formats
 */
export function isOrderPaid(paymentStatus: string): boolean {
  const normalized = paymentStatus.toUpperCase();
  return normalized === 'COMPLETED' || normalized === 'PAID';
}

/**
 * Check if order should show estimated time
 * 
 * Returns true if order is not yet ready/completed
 */
export function shouldShowEstimatedTime(status: string): boolean {
  const normalized = normalizeStatus(status);
  return normalized !== 'READY' && normalized !== 'COMPLETED' && normalized !== 'SERVED';
}
