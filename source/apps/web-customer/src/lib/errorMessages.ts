/**
 * User-friendly error message mapping
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

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Mất kết nối. Vui lòng kiểm tra internet.',
  TIMEOUT: 'Yêu cầu quá lâu. Vui lòng thử lại.',
  
  // API errors
  NOT_FOUND: 'Không tìm thấy.',
  UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền truy cập.',
  SERVER_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  
  // Business errors
  ITEM_NOT_AVAILABLE: 'Món ăn không còn.',
  INVALID_QR: 'Mã QR không hợp lệ.',
  PAYMENT_FAILED: 'Thanh toán thất bại.',
  ORDER_FAILED: 'Đặt hàng thất bại.',
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
