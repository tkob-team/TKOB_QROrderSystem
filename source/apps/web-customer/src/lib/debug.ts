/**
 * Unified debug logging utility for web-customer
 * Compatibility layer over shared logging core
 */

import { log, logError } from '@/shared/logging/logger'

const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true'

function formatMessage(feature: string, action: string): string {
  const timestamp = new Date().toISOString().slice(11, 19) // HH:MM:SS
  return `[${timestamp}] [${feature}] ${action}`
}

/**
 * Log a debug message with feature and action context
 * @param feature Feature name (e.g., 'Cart', 'Checkout', 'Payment')
 * @param action Action name (e.g., 'add', 'place_order', 'success')
 * @param data Optional data to log
 */
export function debugLog(feature: string, action: string, data?: any) {
  if (!USE_LOGGING) return

  log('ui', formatMessage(feature, action), data, { feature, dedupe: false })
}

/**
 * Log a warning message
 */
export function debugWarn(feature: string, action: string, data?: any) {
  if (!USE_LOGGING) return

  log('ui', formatMessage(feature, action), data, { feature, dedupe: false })
}

/**
 * Log an error message
 */
export function debugError(feature: string, action: string, error?: any) {
  if (!USE_LOGGING) return

  logError('ui', formatMessage(feature, action), error, { feature, dedupe: false })
}
