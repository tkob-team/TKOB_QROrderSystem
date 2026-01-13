/**
 * Analytics Adapter Factory
 * DI container for analytics data layer
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { config } from '@/shared/config';
import type { IAnalyticsAdapter } from './adapter.interface';
import { MockAnalyticsAdapter } from './mocks/mock-analytics.adapter';
import { ApiAnalyticsAdapter } from './api/api-analytics.adapter';

function createAnalyticsAdapter(): IAnalyticsAdapter {
  const useMock = isMockEnabled('analytics');
  if (useMock) {
    return new MockAnalyticsAdapter();
  }
  return new ApiAnalyticsAdapter(config.apiUrl);
}

export const analyticsAdapter = createAnalyticsAdapter();
