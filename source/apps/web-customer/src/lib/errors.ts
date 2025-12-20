/**
 * Custom Error Classes for API and Business Logic
 */

/**
 * Base API Error
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code: string = 'API_ERROR',
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
    Object.setPrototypeOf(this, APIError.prototype)
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends APIError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends APIError {
  constructor(message: string = 'Please log in to continue', context?: Record<string, any>) {
    super(message, 'UNAUTHORIZED', 401, context)
    this.name = 'UnauthorizedError'
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends APIError {
  constructor(message: string = 'You do not have permission', context?: Record<string, any>) {
    super(message, 'FORBIDDEN', 403, context)
    this.name = 'ForbiddenError'
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found', context?: Record<string, any>) {
    super(message, 'NOT_FOUND', 404, context)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Server Error (500)
 */
export class ServerError extends APIError {
  constructor(message: string = 'Something went wrong', context?: Record<string, any>) {
    super(message, 'SERVER_ERROR', 500, context)
    this.name = 'ServerError'
    Object.setPrototypeOf(this, ServerError.prototype)
  }
}

/**
 * Network Error (connection issues)
 */
export class NetworkError extends Error {
  constructor(
    message: string = 'Network error. Please check your connection.',
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

/**
 * Business Logic Error
 */
export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'BusinessError'
    Object.setPrototypeOf(this, BusinessError.prototype)
  }
}
