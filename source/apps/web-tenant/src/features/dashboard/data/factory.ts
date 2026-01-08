/**
 * Dashboard Adapter Factory
 * DI container for dashboard data layer
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { config } from '@/shared/config';
import type { IDashboardAdapter } from './adapter.interface';
import { MockDashboardAdapter } from './mocks/mock-dashboard.adapter';
import { ApiDashboardAdapter } from './api/api-dashboard.adapter';

function createDashboardAdapter(): IDashboardAdapter {
  const useMock = isMockEnabled('dashboard');
  console.log('[DashboardFactory] Mock enabled:', useMock);
  if (useMock) {
    return new MockDashboardAdapter();
  }
  return new ApiDashboardAdapter(config.apiUrl);
}

export const dashboardAdapter = createDashboardAdapter();
