/**
 * Auth Adapter Factory
 * Selects mock or real API adapter based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { config } from '@/shared/config';
import type { IAuthAdapter } from './adapter.interface';
import { ApiAuthAdapter } from './api/api-auth.adapter';
import { MockAuthAdapter } from './mocks/mock-auth.adapter';

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

