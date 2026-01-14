/**
 * Auth Adapter Factory
 * Selects mock or real API adapter based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { config } from '@/shared/config';
import { logger } from '@/shared/utils/logger';
import type { IAuthAdapter } from './adapter.interface';
import { ApiAuthAdapter } from './api/api-auth.adapter';
import { MockAuthAdapter } from './mocks/mock-auth.adapter';

const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';

/**
 * Get the auth adapter (mock or real based on feature flag)
 */
export const getAuthAdapter = (): IAuthAdapter => {
  const useMock = isMockEnabled('auth');
  if (logDataEnabled) {
    logger.info('[data] ADAPTER_MODE', { feature: 'auth', mode: useMock ? 'MOCK' : 'REAL_API' });
  }

  return useMock
    ? new MockAuthAdapter()
    : new ApiAuthAdapter(config.apiUrl);
};

/**
 * Singleton instance
 */
export const authAdapter = getAuthAdapter();

