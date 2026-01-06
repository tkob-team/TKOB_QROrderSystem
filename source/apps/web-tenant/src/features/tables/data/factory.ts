/**
 * Tables Adapter Factory
 * Selects mock or real API adapter based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import type { ITablesAdapter } from './tables-adapter.interface';
import { TablesApiAdapter } from './api-tables.adapter';
import { TablesMockAdapter } from './mock-tables.adapter';

function createTablesAdapter(): ITablesAdapter {
  const useMock = isMockEnabled('tables');
  console.log('[TablesFactory] Mock enabled:', useMock);
  return useMock ? new TablesMockAdapter() : new TablesApiAdapter();
}

/**
 * Singleton instance
 */
export const tablesAdapter = createTablesAdapter();
