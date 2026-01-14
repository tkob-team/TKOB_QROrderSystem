// Tables feature data factory - selector for mock vs real adapter

import { USE_MOCK_API } from '@/shared/config';
import { log } from '@/shared/logging/logger';
import type { ITablesAdapter } from './adapter.interface';
import { MockTablesAdapter } from './mocks/tables.adapter';
import { TablesAdapter } from './api/tables.adapter';

/**
 * Feature-owned factory for table data adapters
 * Selects between mock and real implementations based on API_MODE
 * 
 * This lives in the feature to make data access transparent to consumers.
 * All table data operations flow through this factory.
 */
const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';

export class TableDataFactory {
  private static instance: ITablesAdapter;

  static getStrategy(): ITablesAdapter {
    if (!this.instance) {
      if (USE_LOGGING) {
        log(
          'data',
          'Adapter mode selected',
          {
            mode: USE_MOCK_API ? 'MOCK' : 'REAL',
            strategy: USE_MOCK_API ? 'MockTablesAdapter' : 'TablesAdapter',
          },
          { feature: 'tables' },
        );
      }

      this.instance = USE_MOCK_API ? new MockTablesAdapter() : new TablesAdapter();
    }
    return this.instance;
  }

  /**
   * Reset strategy (useful for testing/switching API modes)
   */
  static reset(): void {
    delete (this as any).instance;
  }
}
