/**
 * Error normalization utility
 * Ensures all thrown/rejected values are properly formatted Error instances
 */

export interface AppError extends Error {
  code?: string;
  context?: string;
  originalError?: any;
  isSafe?: boolean;
}

/**
 * Normalize unknown throw/reject value to a proper AppError instance
 * Safe to call with any value - will always return an Error instance
 * 
 * @param error - Any value that was thrown or rejected
 * @param context - Context description (e.g., "auth.login", "dashboard.getOrders")
 * @returns Normalized AppError instance
 */
export function toAppError(error: any, context: string = 'unknown'): AppError {
  // Already an Error instance - use as-is
  if (error instanceof Error) {
    const appError: AppError = error as AppError;
    appError.context = context;
    appError.isSafe = true;
    return appError;
  }

  // Undefined or null - common issue
  if (error === undefined || error === null) {
    const appError = new Error(`${context}: Undefined or null error`);
    (appError as AppError).context = context;
    (appError as AppError).originalError = error;
    (appError as AppError).isSafe = true;
    return appError as AppError;
  }

  // String message
  if (typeof error === 'string') {
    const appError = new Error(`${context}: ${error}`);
    (appError as AppError).context = context;
    (appError as AppError).originalError = error;
    (appError as AppError).isSafe = true;
    return appError as AppError;
  }

  // Object with message or code
  if (typeof error === 'object') {
    const message = 
      (error as any).message || 
      (error as any).statusText || 
      (error as any).error || 
      (error as any).code || 
      'Unknown error';
    
    const appError = new Error(`${context}: ${message}`);
    (appError as AppError).context = context;
    (appError as AppError).originalError = error;
    (appError as AppError).code = (error as any).code || (error as any).status;
    (appError as AppError).isSafe = true;
    return appError as AppError;
  }

  // Fallback for any other type
  const appError = new Error(`${context}: ${String(error)}`);
  (appError as AppError).context = context;
  (appError as AppError).originalError = error;
  (appError as AppError).isSafe = true;
  return appError as AppError;
}

/**
 * Safe JSON stringification for logging
 * Handles circular references and PII filtering
 */
export function safeStringify(obj: any, maxLength: number = 500): string {
  try {
    const str = JSON.stringify(obj, (key, value) => {
      // Filter out sensitive keys
      if (['password', 'token', 'secret', 'apiKey', 'refreshToken', 'accessToken'].includes(key.toLowerCase())) {
        return '[REDACTED]';
      }
      return value;
    });
    
    return str.length > maxLength 
      ? str.substring(0, maxLength) + '...'
      : str;
  } catch (e) {
    return `[Stringify failed: ${String(e)}]`;
  }
}
