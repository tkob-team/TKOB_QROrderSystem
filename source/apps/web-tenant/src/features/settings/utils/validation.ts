/**
 * Validation utilities for account and tenant settings
 */

import { PASSWORD_MIN_LENGTH } from '../model/constants';

/**
 * Validates display name is non-empty
 */
export function validateDisplayName(displayName: string): { valid: boolean; error?: string } {
  if (!displayName.trim()) {
    return { valid: false, error: 'Display name is required' };
  }
  return { valid: true };
}

/**
 * Validates restaurant name is non-empty
 */
export function validateRestaurantName(restaurantName: string): { valid: boolean; error?: string } {
  if (!restaurantName.trim()) {
    return { valid: false, error: 'Restaurant name is required' };
  }
  return { valid: true };
}

/**
 * Validates password meets requirements
 */
export function validatePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { valid: false, error: 'Please fill all password fields' };
  }
  if (newPassword !== confirmPassword) {
    return { valid: false, error: 'New passwords do not match' };
  }
  if (newPassword.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }
  return { valid: true };
}

/**
 * Validates 2FA verification code format
 */
export function validate2FACode(code: string): { valid: boolean; error?: string } {
  if (code.length !== 6) {
    return { valid: false, error: 'Enter the 6-digit code to enable 2FA' };
  }
  return { valid: true };
}
