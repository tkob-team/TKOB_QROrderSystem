/**
 * Auth Adapter Factory
 * Selects mock or real API adapter based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { config } from '@/shared/config';
import type { IAuthAdapter } from './auth-adapter.interface';
import { ApiAuthAdapter } from './api-auth.adapter';
import { MockAuthAdapter } from './mock-auth.adapter';

/**
 * Get the auth adapter (mock or real based on feature flag)
 */
export const getAuthAdapter = (): IAuthAdapter => {
  return isMockEnabled('auth') 
    ? new MockAuthAdapter() 
    : new ApiAuthAdapter(config.apiUrl);
};

/**
 * Singleton instance
 */
export const authAdapter = getAuthAdapter();

/**
 * Legacy alias for backward compatibility
 */
export const authService = authAdapter;
