/**
 * Error Handling Utilities for Frontend
 * Provides user-friendly error messages and retry logic
 * Uses centralized English text constants
 */

import { ERROR_TEXT } from '@/constants/text'

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

// User-friendly error messages in English
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: ERROR_TEXT.checkConnection,
  [ErrorType.TIMEOUT]: ERROR_TEXT.serviceUnavailable,
  [ErrorType.SESSION_EXPIRED]: ERROR_TEXT.sessionExpiredDesc,
  [ErrorType.PAYMENT_FAILED]: ERROR_TEXT.paymentFailed,
  [ErrorType.VALIDATION]: ERROR_TEXT.validationError,
  [ErrorType.NOT_FOUND]: ERROR_TEXT.pageNotFoundDesc,
  [ErrorType.UNAUTHORIZED]: ERROR_TEXT.accessDeniedDesc,
  [ErrorType.FORBIDDEN]: ERROR_TEXT.accessDeniedDesc,
  [ErrorType.SERVER_ERROR]: ERROR_TEXT.internalErrorDesc,
  [ErrorType.UNKNOWN]: ERROR_TEXT.somethingWentWrong,
};

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  retryable: boolean;
  code?: string;
}

/**
 * Classify error from API response or Error object
 */
export function classifyError(error: unknown): AppError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: ERROR_MESSAGES[ErrorType.NETWORK],
      originalError: error,
      retryable: true,
    };
  }

  // Axios-like error with response
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
    const status = axiosError.response?.status;
    const serverMessage = axiosError.response?.data?.message;

    if (status === 401) {
      return {
        type: ErrorType.UNAUTHORIZED,
        message: ERROR_MESSAGES[ErrorType.UNAUTHORIZED],
        originalError: error,
        retryable: false,
        code: 'UNAUTHORIZED',
      };
    }

    if (status === 403) {
      return {
        type: ErrorType.FORBIDDEN,
        message: ERROR_MESSAGES[ErrorType.FORBIDDEN],
        originalError: error,
        retryable: false,
        code: 'FORBIDDEN',
      };
    }

    if (status === 404) {
      return {
        type: ErrorType.NOT_FOUND,
        message: serverMessage || ERROR_MESSAGES[ErrorType.NOT_FOUND],
        originalError: error,
        retryable: false,
        code: 'NOT_FOUND',
      };
    }

    if (status === 400 || status === 422) {
      return {
        type: ErrorType.VALIDATION,
        message: serverMessage || ERROR_MESSAGES[ErrorType.VALIDATION],
        originalError: error,
        retryable: false,
        code: 'VALIDATION_ERROR',
      };
    }

    if (status && status >= 500) {
      return {
        type: ErrorType.SERVER_ERROR,
        message: ERROR_MESSAGES[ErrorType.SERVER_ERROR],
        originalError: error,
        retryable: true,
        code: `SERVER_${status}`,
      };
    }
  }

  // AbortError (timeout)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      type: ErrorType.TIMEOUT,
      message: ERROR_MESSAGES[ErrorType.TIMEOUT],
      originalError: error,
      retryable: true,
    };
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : ERROR_MESSAGES[ErrorType.UNKNOWN],
    originalError: error,
    retryable: true,
  };
}

/**
 * Get user-friendly message for an error type
 */
export function getErrorMessage(type: ErrorType): string {
  return ERROR_MESSAGES[type];
}

/**
 * Check if we're offline
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Execute a function with exponential backoff retry
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: AppError) => void,
): Promise<T> {
  const { maxAttempts, baseDelay, maxDelay, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: AppError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = classifyError(error);

      // Don't retry non-retryable errors
      if (!lastError.retryable || attempt === maxAttempts) {
        throw lastError;
      }

      // Notify about retry
      onRetry?.(attempt, lastError);

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay,
      );

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Create an AbortController with timeout
 */
export function createTimeoutController(timeoutMs: number): {
  controller: AbortController;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    controller,
    cleanup: () => clearTimeout(timeoutId),
  };
}
