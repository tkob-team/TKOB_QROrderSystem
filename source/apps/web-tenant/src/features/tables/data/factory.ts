/**
 * Tables Adapter Factory
 * Selects mock or real API adapter based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { logger } from '@/shared/utils/logger';
import type { ITablesAdapter } from './adapter.interface';
import { TablesApiAdapter } from './api/api-tables.adapter';
import { TablesMockAdapter } from './mocks/mock-tables.adapter';

const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';

function createTablesAdapter(): ITablesAdapter {
  const useMock = isMockEnabled('tables');
  if (logDataEnabled) {
    logger.info('[data] ADAPTER_MODE', { feature: 'tables', mode: useMock ? 'MOCK' : 'REAL_API' });
  }
  return useMock ? new TablesMockAdapter() : new TablesApiAdapter();
}

/**
 * Singleton instance
 */
export const tablesAdapter = createTablesAdapter();
