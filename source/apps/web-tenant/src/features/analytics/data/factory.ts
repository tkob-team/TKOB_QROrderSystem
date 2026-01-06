/**
 * Analytics Adapter Factory
 * DI container for analytics data layer
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { config } from '@/shared/config';
import type { IAnalyticsAdapter } from './analytics-adapter.interface';
import { MockAnalyticsAdapter } from './mock-analytics.adapter';
import { ApiAnalyticsAdapter } from './api-analytics.adapter';

function createAnalyticsAdapter(): IAnalyticsAdapter {
  const useMock = isMockEnabled('analytics');
  console.log('[AnalyticsFactory] Mock enabled:', useMock);
  if (useMock) {
    return new MockAnalyticsAdapter();
  }
  return new ApiAnalyticsAdapter(config.apiUrl);
}

export const analyticsAdapter = createAnalyticsAdapter();
