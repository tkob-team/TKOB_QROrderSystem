/**
 * User-friendly error message mapping
 * Uses centralized English text constants
 */

import {
  APIError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  NetworkError,
  BusinessError,
} from './errors'
import { ERROR_TEXT } from '@/constants/text'

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: ERROR_TEXT.networkError,
  TIMEOUT: ERROR_TEXT.serviceUnavailable,
  
  // API errors
  NOT_FOUND: ERROR_TEXT.pageNotFound,
  UNAUTHORIZED: ERROR_TEXT.accessDenied,
  FORBIDDEN: ERROR_TEXT.accessDenied,
  SERVER_ERROR: ERROR_TEXT.serverError,
  VALIDATION_ERROR: ERROR_TEXT.validationError,
  
  // Business errors
  ITEM_NOT_AVAILABLE: ERROR_TEXT.itemNotAvailable,
  INVALID_QR: ERROR_TEXT.invalidQR,
  PAYMENT_FAILED: ERROR_TEXT.paymentFailed,
  ORDER_FAILED: ERROR_TEXT.orderFailed,
} as const

/**
 * Get user-friendly error message from error object
 */
export function getUserFriendlyMessage(error: unknown): string {
  // Handle custom errors
  if (error instanceof NetworkError) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  
  if (error instanceof NotFoundError) {
    return error.message || ERROR_MESSAGES.NOT_FOUND
  }
  
  if (error instanceof UnauthorizedError) {
    return ERROR_MESSAGES.UNAUTHORIZED
  }
  
  if (error instanceof ForbiddenError) {
    return ERROR_MESSAGES.FORBIDDEN
  }
  
  if (error instanceof ValidationError) {
    return error.message || ERROR_MESSAGES.VALIDATION_ERROR
  }
  
  if (error instanceof ServerError) {
    return ERROR_MESSAGES.SERVER_ERROR
  }
  
  if (error instanceof BusinessError) {
    return error.message
  }
  
  if (error instanceof APIError) {
    return error.message || ERROR_MESSAGES.SERVER_ERROR
  }
  
  // Handle standard errors
  if (error instanceof Error) {
    // Check for network-related errors
    if (error.message.toLowerCase().includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR
    }
    if (error.message.toLowerCase().includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT
    }
    
    return error.message
  }
  
  // Fallback
  return ERROR_MESSAGES.SERVER_ERROR
}

/**
 * Transform HTTP status code to appropriate error class
 */
export function createErrorFromStatus(statusCode: number, message?: string): APIError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message || 'Invalid request')
    case 401:
      return new UnauthorizedError(message)
    case 403:
      return new ForbiddenError(message)
    case 404:
      return new NotFoundError(message)
    case 500:
    default:
      return new ServerError(message)
  }
}
