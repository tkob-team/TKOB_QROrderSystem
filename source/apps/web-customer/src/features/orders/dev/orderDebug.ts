/**
 * Order & Payment Debug Logging Utility (DEPRECATED)
 * 
 * This module now delegates to the shared logger with [debug-order] category.
 * All logs respect NEXT_PUBLIC_USE_LOGGING env flag and use ID masking/redaction.
 * 
 * DEPRECATED FLAGS:
 * - NEXT_PUBLIC_MOCK_DEBUG (still supported as alias)
 * - NEXT_PUBLIC_DEBUG_CUSTOMER (still supported as alias)
 * 
 * NEW FLAG:
 * - NEXT_PUBLIC_USE_LOGGING=true (primary gate)
 * 
 * Usage:
 *   debugOrder('create-order', { tableId, orderId, paymentStatus })
 *   debugOrder('payment-update', { orderId, paymentStatus, storageKey })
 *   debugOrder('order-read', { orderId, found: true, storageKey })
 * 
 * Note: Raw IDs are automatically masked. Use shared logger directly for production.
 */

import { log as sharedLog, logError as sharedLogError } from '@/shared/logging/logger'
import { redactPayload } from '@/shared/logging/redact'

export interface OrderDebugPayload {
  // Core identifiers
  tableId?: string;
  orderId?: string;
  storageKey?: string;
  
  // State snapshots
  paymentStatus?: string;
  orderStatus?: string;
  
  // Context
  callsite?: string;
  
  // Additional data
  [key: string]: unknown;
}

/**
 * Determine if logging is enabled
 * Primary: NEXT_PUBLIC_USE_LOGGING
 * Legacy fallback: NEXT_PUBLIC_MOCK_DEBUG or NEXT_PUBLIC_DEBUG_CUSTOMER
 * Never logs in production regardless of flags
 */
function isLoggingEnabled(): boolean {
  if (typeof process === 'undefined') {
    return false; // Browser-side check failed
  }
  
  // Never log in production
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  // Primary flag
  if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
    return true;
  }
  
  // Legacy flags (deprecated but supported)
  if (process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true' || 
      process.env.NEXT_PUBLIC_DEBUG_CUSTOMER === 'true') {
    return true;
  }
  
  return false;
}

/**
 * Get current timestamp in ISO format with milliseconds
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

/**
 * Mask ID values to prevent PII leaks
 */
function maskId(id: string | undefined): string {
  if (!id) return '';
  return id.length > 4 ? `***${id.slice(-4)}` : id;
}

/**
 * Format payload for readable console output
 */
function formatPayload(payload: OrderDebugPayload): string {
  const entries = Object.entries(payload)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${value}`;
    });
  
  return `{ ${entries.join(', ')} }`;
}

/**
 * Main debug logging function (DEPRECATED - delegates to shared logger)
 * 
 * @param event - Event name (e.g., 'create-order', 'payment-start', 'read-order-detail')
 * @param payload - Structured data to log (IDs will be masked)
 * 
 * Now uses:
 * - Shared logger with [data] category (orders feature)
 * - Automatic ID masking (orderId, tableId, sessionId)
 * - Payload redaction via redactPayload()
 * - NEXT_PUBLIC_USE_LOGGING env gate
 * 
 * Example events:
 * - 'add-to-cart': When user adds item to cart
 * - 'create-order': When order is created from checkout
 * - 'order-persisted': When order saved to storage
 * - 'read-orders-list': When loading orders for list page
 * - 'read-order-detail': When loading single order
 * - 'payment-start': When payment process begins
 * - 'payment-persisted': When payment status updated in storage
 * - 'payment-success-navigation': After successful payment
 * - 'storage-key-lookup': When accessing storage key
 * - 'enum-normalization': When normalizing enum values
 * - 'mismatch-detected': When inconsistency found
 */
export function debugOrder(event: string, payload: OrderDebugPayload): void {
  if (!isLoggingEnabled()) {
    return; // Silently skip if logging disabled
  }

  // Mask sensitive IDs before logging
  const maskedPayload = {
    ...payload,
    orderId: payload.orderId ? maskId(payload.orderId) : undefined,
    tableId: payload.tableId ? maskId(payload.tableId) : undefined,
    sessionId: (payload as any).sessionId ? maskId((payload as any).sessionId) : undefined,
  };
  
  // Apply full redaction rules (removes session objects, etc.)
  const redactedPayload = redactPayload(maskedPayload);

  // Determine if error event
  const isError = event.includes('error') || event.includes('mismatch') || event.includes('failed');
  
  // Delegate to shared logger with [data] category (orders feature)
  // Event name is the message, payload is the data
  if (isError) {
    sharedLogError('data', event, redactedPayload, { feature: 'orders', dedupe: false });
  } else {
    sharedLog('data', event, redactedPayload, { feature: 'orders', dedupe: false });
  }
  
  // Also log to window for programmatic access (legacy compatibility)
  if (typeof window !== 'undefined') {
    const timestamp = getTimestamp();
    (window as any).__orderDebugLogs = (window as any).__orderDebugLogs || [];
    (window as any).__orderDebugLogs.push({
      timestamp,
      event,
      payload: maskedPayload, // Store masked version
    });
  }
}

/**
 * Export recent debug logs (for manual inspection)
 * Useful for: DevTools console → window.__orderDebugLogs
 */
export function getOrderDebugLogs(): Array<{
  timestamp: string;
  event: string;
  payload: OrderDebugPayload;
}> {
  if (typeof window !== 'undefined') {
    return (window as any).__orderDebugLogs || [];
  }
  return [];
}

/**
 * Clear debug logs
 */
export function clearOrderDebugLogs(): void {
  if (typeof window !== 'undefined') {
    (window as any).__orderDebugLogs = [];
  }
}

/**
 * Helper to check if a specific event was logged
 */
export function hasOrderDebugEvent(eventName: string): boolean {
  return getOrderDebugLogs().some(log => log.event === eventName);
}

/**
 * Export all logs as CSV for analysis
 */
export function exportOrderDebugLogs(filename: string = 'order-debug-logs.csv'): void {
  if (typeof window === 'undefined') {
    console.warn('Cannot export logs: not in browser environment');
    return;
  }

  const logs = getOrderDebugLogs();
  
  if (logs.length === 0) {
    console.warn('No logs to export');
    return;
  }

  // Convert to CSV
  const headers = ['Timestamp', 'Event', 'TableId', 'OrderId', 'PaymentStatus', 'OrderStatus', 'Callsite', 'Full Payload'];
  const rows = logs.map(log => [
    log.timestamp,
    log.event,
    log.payload.tableId || '',
    log.payload.orderId || '',
    log.payload.paymentStatus || '',
    log.payload.orderStatus || '',
    log.payload.callsite || '',
    JSON.stringify(log.payload),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);

  console.log(`✓ Exported ${logs.length} log entries to ${filename}`);
}

/**
 * Production safety check - verify logging is disabled in prod
 * Note: isLoggingEnabled() now checks NODE_ENV first, so this should always pass
 */
export function verifyProductionSafety(): boolean {
  if (process.env.NODE_ENV === 'production') {
    // Extra safety: never log in production
    if (isLoggingEnabled()) {
      console.error('[SECURITY] Debug logging enabled in production! This should never happen.');
      console.error('Check: NEXT_PUBLIC_USE_LOGGING, NEXT_PUBLIC_MOCK_DEBUG, NEXT_PUBLIC_DEBUG_CUSTOMER');
      return false;
    }
  }
  return true;
}
