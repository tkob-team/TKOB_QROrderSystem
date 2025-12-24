/**
 * Tables Adapter Factory
 * Always uses real API adapter
 */

import type { ITablesAdapter } from './types';
import { TablesApiAdapter } from './api';

/**
 * Get the tables adapter (always real API)
 */
export const getTablesAdapter = (): ITablesAdapter => {
  return new TablesApiAdapter();
};

/**
 * Singleton instance
 */
export const tablesAdapter = getTablesAdapter();
