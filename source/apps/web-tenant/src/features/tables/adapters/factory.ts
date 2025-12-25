/**
 * Tables Adapter Factory
 * Switches between Mock and Real API based on environment
 */

import type { ITablesAdapter } from './types';
import { TablesApiAdapter } from './api';
import { TablesMockAdapter } from './mock';

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Get the tables adapter based on environment
 */
export const getTablesAdapter = (): ITablesAdapter => {
  if (useMockData) {
    console.log('🎭 [TablesAdapter] Using Mock Adapter');
    return new TablesMockAdapter();
  }
  console.log('🌐 [TablesAdapter] Using Real API Adapter');
  return new TablesApiAdapter();
};

/**
 * Singleton instance
 */
export const tablesAdapter = getTablesAdapter();
