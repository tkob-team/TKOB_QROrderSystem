// Menu feature data factory - selector for mock vs real adapter

import { USE_MOCK_API } from '@/shared/config';
import { log } from '@/shared/logging/logger';
import { IMenuAdapter } from './adapter.interface';
import { MockMenuAdapter } from './mocks/menu.adapter';
import { MenuAdapter } from './api/menu.adapter';

/**
 * Feature-owned factory for menu data adapters
 * Selects between mock and real implementations based on API_MODE
 * 
 * This lives in the feature to make data access transparent to consumers.
 * All menu data fetching flows through this factory.
 */
const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';

export class MenuDataFactory {
  private static instance: IMenuAdapter;

  static getStrategy(): IMenuAdapter {
    if (!this.instance) {
      if (USE_LOGGING) {
        log(
          'data',
          'Adapter mode selected',
          {
            mode: USE_MOCK_API ? 'MOCK' : 'REAL',
            strategy: USE_MOCK_API ? 'MockMenuAdapter' : 'MenuAdapter',
          },
          { feature: 'menu' },
        );
      }

      this.instance = USE_MOCK_API ? new MockMenuAdapter() : new MenuAdapter();
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
