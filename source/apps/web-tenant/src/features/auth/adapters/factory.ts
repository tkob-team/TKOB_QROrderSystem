/**
 * Auth Adapter Factory
 * Always uses real API adapter
 */

import type { IAuthAdapter } from './types';
import { AuthApiAdapter } from './api';

/**
 * Get the auth adapter (always real API)
 */
export const getAuthAdapter = (): IAuthAdapter => {
  return new AuthApiAdapter();
};

/**
 * Singleton instance
 */
export const authAdapter = getAuthAdapter();
