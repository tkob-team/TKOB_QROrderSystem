/**
 * Dashboard Adapter Factory
 * DI container for dashboard data layer
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { config } from '@/shared/config';
import { logger } from '@/shared/utils/logger';
import type { IDashboardAdapter } from './adapter.interface';
import { MockDashboardAdapter } from './mocks/mock-dashboard.adapter';
import { ApiDashboardAdapter } from './api/api-dashboard.adapter';

function createDashboardAdapter(): IDashboardAdapter {
  const useMock = isMockEnabled('dashboard');
  
  if (typeof window !== 'undefined') {
    logger.info('[data] ADAPTER_MODE', { feature: 'dashboard', mode: useMock ? 'MOCK' : 'REAL_API' });
  }
  
  if (useMock) {
    return new MockDashboardAdapter();
  }
  return new ApiDashboardAdapter(config.apiUrl);
}

export const dashboardAdapter = createDashboardAdapter();
