// Orders feature data factory

import { USE_MOCK_API } from '@/shared/config';
import { log } from '@/shared/logging/logger';
import { IOrdersAdapter } from './adapter.interface';
import { MockOrdersAdapter } from './mocks/orders.adapter';
import { OrdersAdapter } from './api/orders.adapter';

/**
 * Feature-owned factory for orders data adapters
 */
const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';

export class OrdersDataFactory {
  private static instance: IOrdersAdapter;

  static getStrategy(): IOrdersAdapter {
    if (!this.instance) {
      if (USE_LOGGING) {
        log(
          'data',
          'Adapter mode selected',
          {
            mode: USE_MOCK_API ? 'MOCK' : 'REAL',
            strategy: USE_MOCK_API ? 'MockOrdersAdapter' : 'OrdersAdapter',
          },
          { feature: 'orders' },
        );
      }

      this.instance = USE_MOCK_API ? new MockOrdersAdapter() : new OrdersAdapter();
    }
    return this.instance;
  }

  static reset(): void {
    delete (this as any).instance;
  }
}
