/**
 * Order & Payment Debug Logging Utility
 * 
 * Structured logging for mock/dev environments only.
 * Helps diagnose key mismatches, state inconsistencies, and timing issues.
 * 
 * Usage:
 *   debugOrder('create-order', { tableId, orderId, paymentStatus })
 *   debugOrder('payment-update', { orderId, paymentStatus, storageKey })
 *   debugOrder('order-read', { orderId, found: true, storageKey })
 * 
 * Logs are prefixed [Orders] for easy filtering in DevTools
 */

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
 * Only logs in mock dev environments, never in production
 */
function isLoggingEnabled(): boolean {
  if (typeof process === 'undefined') {
    return false; // Browser-side check failed
  }
  
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  const isNotProduction = process.env.NODE_ENV !== 'production';
  
  return isMockMode && isNotProduction;
}

/**
 * Get current timestamp in ISO format with milliseconds
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString();
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
 * Main debug logging function
 * 
 * @param event - Event name (e.g., 'create-order', 'payment-start', 'read-order-detail')
 * @param payload - Structured data to log
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
    return; // Silently skip if not in mock dev mode
  }

  const timestamp = getTimestamp();
  const formattedPayload = formatPayload(payload);
  
  // Color-coded console output for different event types
  let style = 'color: #666; font-weight: bold;';
  
  if (event.includes('error') || event.includes('mismatch') || event.includes('failed')) {
    style = 'color: #ff6b6b; font-weight: bold;'; // Red for errors
  } else if (event.includes('persisted') || event.includes('saved')) {
    style = 'color: #51cf66; font-weight: bold;'; // Green for saves
  } else if (event.includes('payment')) {
    style = 'color: #ffd43b; font-weight: bold;'; // Yellow for payment
  } else if (event.includes('read')) {
    style = 'color: #74c0fc; font-weight: bold;'; // Blue for reads
  }

  // Log to console with timestamp
  const prefix = `[Orders] ${event}`;
  const message = `${timestamp} - ${formattedPayload}`;
  
  if (typeof console !== 'undefined') {
    console.log(`%c${prefix}`, style, message);
    
    // Also log to window for programmatic access if needed
    if (typeof window !== 'undefined') {
      (window as any).__orderDebugLogs = (window as any).__orderDebugLogs || [];
      (window as any).__orderDebugLogs.push({
        timestamp,
        event,
        payload,
      });
    }
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
 */
export function verifyProductionSafety(): boolean {
  if (process.env.NODE_ENV === 'production') {
    // Extra safety: never log in production
    if (isLoggingEnabled()) {
      console.error('[SECURITY] Debug logging enabled in production! This should never happen.');
      return false;
    }
  }
  return true;
}
