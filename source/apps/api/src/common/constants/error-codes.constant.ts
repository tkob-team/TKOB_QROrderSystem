/**
 * Centralized error codes following OPENAPI.md spec
 * Format: CATEGORY_SPECIFIC_ERROR
 */
export enum ErrorCode {
  // ==================== AUTH ERRORS (1000-1999) ====================
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_SLUG_ALREADY_EXISTS = 'AUTH_SLUG_ALREADY_EXISTS',
  AUTH_OTP_INVALID = 'AUTH_OTP_INVALID',
  AUTH_OTP_EXPIRED = 'AUTH_OTP_EXPIRED',
  AUTH_REGISTRATION_TOKEN_INVALID = 'AUTH_REGISTRATION_TOKEN_INVALID',
  AUTH_SESSION_NOT_FOUND = 'AUTH_SESSION_NOT_FOUND',
  AUTH_ACCOUNT_INACTIVE = 'AUTH_ACCOUNT_INACTIVE',
  AUTH_PASSWORD_INCORRECT = 'AUTH_PASSWORD_INCORRECT',

  // ==================== TENANT ERRORS (2000-2999) ====================
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  TENANT_SLUG_TAKEN = 'TENANT_SLUG_TAKEN',
  TENANT_SUSPENDED = 'TENANT_SUSPENDED',
  TENANT_ONBOARDING_INCOMPLETE = 'TENANT_ONBOARDING_INCOMPLETE',
  TENANT_PAYMENT_CONFIG_MISSING = 'TENANT_PAYMENT_CONFIG_MISSING',

  // ==================== USER ERRORS (3000-3999) ====================
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  USER_INSUFFICIENT_PERMISSIONS = 'USER_INSUFFICIENT_PERMISSIONS',

  // ==================== MENU ERRORS (4000-4999) ====================
  MENU_CATEGORY_NOT_FOUND = 'MENU_CATEGORY_NOT_FOUND',
  MENU_ITEM_NOT_FOUND = 'MENU_ITEM_NOT_FOUND',
  MENU_ITEM_UNAVAILABLE = 'MENU_ITEM_UNAVAILABLE',
  MENU_MODIFIER_GROUP_NOT_FOUND = 'MENU_MODIFIER_GROUP_NOT_FOUND',
  MENU_MODIFIER_OPTION_NOT_FOUND = 'MENU_MODIFIER_OPTION_NOT_FOUND',

  // ==================== TABLE ERRORS (5000-5999) ====================
  TABLE_NOT_FOUND = 'TABLE_NOT_FOUND',
  TABLE_NUMBER_EXISTS = 'TABLE_NUMBER_EXISTS',
  TABLE_OCCUPIED = 'TABLE_OCCUPIED',
  TABLE_INACTIVE = 'TABLE_INACTIVE',
  TABLE_QR_INVALID = 'TABLE_QR_INVALID',
  TABLE_QR_EXPIRED = 'TABLE_QR_EXPIRED',
  TABLE_QR_REGENERATED = 'TABLE_QR_REGENERATED',
  TABLE_HAS_ACTIVE_ORDERS = 'TABLE_HAS_ACTIVE_ORDERS',

  // ==================== ORDER ERRORS (6000-6999) ====================
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_INVALID_STATUS = 'ORDER_INVALID_STATUS',
  ORDER_CANNOT_MODIFY = 'ORDER_CANNOT_MODIFY',
  ORDER_ITEMS_EMPTY = 'ORDER_ITEMS_EMPTY',
  ORDER_PAYMENT_FAILED = 'ORDER_PAYMENT_FAILED',
  ORDER_ALREADY_PAID = 'ORDER_ALREADY_PAID',

  // ==================== PAYMENT ERRORS (7000-7999) ====================
  PAYMENT_METHOD_INVALID = 'PAYMENT_METHOD_INVALID',
  PAYMENT_AMOUNT_MISMATCH = 'PAYMENT_AMOUNT_MISMATCH',
  PAYMENT_STRIPE_ERROR = 'PAYMENT_STRIPE_ERROR',
  PAYMENT_REFUND_FAILED = 'PAYMENT_REFUND_FAILED',

  // ==================== VALIDATION ERRORS (8000-8999) ====================
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_FIELD_REQUIRED = 'VALIDATION_FIELD_REQUIRED',
  VALIDATION_FIELD_INVALID = 'VALIDATION_FIELD_INVALID',

  // ==================== SYSTEM ERRORS (9000-9999) ====================
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  REDIS_ERROR = 'REDIS_ERROR',
  EMAIL_SERVICE_ERROR = 'EMAIL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Error messages mapping
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Auth
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Token has expired',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Invalid token',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'Authentication required',
  [ErrorCode.AUTH_FORBIDDEN]: 'You do not have permission to access this resource',
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 'Email already exists',
  [ErrorCode.AUTH_SLUG_ALREADY_EXISTS]: 'Slug already exists',
  [ErrorCode.AUTH_OTP_INVALID]: 'Invalid OTP code',
  [ErrorCode.AUTH_OTP_EXPIRED]: 'OTP has expired',
  [ErrorCode.AUTH_REGISTRATION_TOKEN_INVALID]: 'Registration token is invalid or expired',
  [ErrorCode.AUTH_SESSION_NOT_FOUND]: 'Session not found',
  [ErrorCode.AUTH_ACCOUNT_INACTIVE]: 'Account is not active',
  [ErrorCode.AUTH_PASSWORD_INCORRECT]: 'Current password is incorrect',

  // Tenant
  [ErrorCode.TENANT_NOT_FOUND]: 'Tenant not found',
  [ErrorCode.TENANT_SLUG_TAKEN]: 'Tenant slug is already taken',
  [ErrorCode.TENANT_SUSPENDED]: 'Tenant account is suspended',
  [ErrorCode.TENANT_ONBOARDING_INCOMPLETE]: 'Please complete onboarding first',
  [ErrorCode.TENANT_PAYMENT_CONFIG_MISSING]: 'Payment configuration is missing',

  // User
  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  [ErrorCode.USER_INACTIVE]: 'User account is inactive',
  [ErrorCode.USER_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',

  // Menu
  [ErrorCode.MENU_CATEGORY_NOT_FOUND]: 'Menu category not found',
  [ErrorCode.MENU_ITEM_NOT_FOUND]: 'Menu item not found',
  [ErrorCode.MENU_ITEM_UNAVAILABLE]: 'Menu item is currently unavailable',
  [ErrorCode.MENU_MODIFIER_GROUP_NOT_FOUND]: 'Modifier group not found',
  [ErrorCode.MENU_MODIFIER_OPTION_NOT_FOUND]: 'Modifier option not found',

  // Table
  [ErrorCode.TABLE_NOT_FOUND]: 'Table not found',
  [ErrorCode.TABLE_NUMBER_EXISTS]: 'Table number already exists',
  [ErrorCode.TABLE_OCCUPIED]: 'Table is currently occupied',
  [ErrorCode.TABLE_INACTIVE]: 'Table is temporarily unavailable. Please ask staff for assistance.',
  [ErrorCode.TABLE_QR_INVALID]: 'Invalid QR code. Please ask staff for assistance.',
  [ErrorCode.TABLE_QR_EXPIRED]: 'QR code has expired. Please ask staff for assistance.',
  [ErrorCode.TABLE_QR_REGENERATED]:
    'This QR code is no longer valid. Please ask staff for assistance.',
  [ErrorCode.TABLE_HAS_ACTIVE_ORDERS]: 'Cannot delete table with active orders',

  // Order
  [ErrorCode.ORDER_NOT_FOUND]: 'Order not found',
  [ErrorCode.ORDER_INVALID_STATUS]: 'Invalid order status',
  [ErrorCode.ORDER_CANNOT_MODIFY]: 'Order cannot be modified in current status',
  [ErrorCode.ORDER_ITEMS_EMPTY]: 'Order must contain at least one item',
  [ErrorCode.ORDER_PAYMENT_FAILED]: 'Payment failed',
  [ErrorCode.ORDER_ALREADY_PAID]: 'Order has already been paid',

  // Payment
  [ErrorCode.PAYMENT_METHOD_INVALID]: 'Invalid payment method',
  [ErrorCode.PAYMENT_AMOUNT_MISMATCH]: 'Payment amount does not match order total',
  [ErrorCode.PAYMENT_STRIPE_ERROR]: 'Stripe payment error',
  [ErrorCode.PAYMENT_REFUND_FAILED]: 'Refund failed',

  // Validation
  [ErrorCode.VALIDATION_FAILED]: 'Validation failed',
  [ErrorCode.VALIDATION_FIELD_REQUIRED]: 'Required field is missing',
  [ErrorCode.VALIDATION_FIELD_INVALID]: 'Field value is invalid',

  // System
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ErrorCode.DATABASE_ERROR]: 'Database error occurred',
  [ErrorCode.REDIS_ERROR]: 'Cache service error',
  [ErrorCode.EMAIL_SERVICE_ERROR]: 'Email service error',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later',
};
