// Payment feature data factory - selector for mock vs real adapter

import { USE_MOCK_API } from '@/shared/config';
import { log } from '@/shared/logging/logger';
import type { IPaymentAdapter } from './adapter.interface';
import { MockPaymentAdapter } from './mocks/payment.adapter';
import { PaymentAdapter } from './api/payment.adapter';

/**
 * Feature-owned factory for payment data adapters
 * Selects between mock and real implementations based on API_MODE
 * 
 * This lives in the feature to make data access transparent to consumers.
 * All payment data operations flow through this factory.
 */
const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';

export class PaymentDataFactory {
  private static instance: IPaymentAdapter;

  static getStrategy(): IPaymentAdapter {
    if (!this.instance) {
      if (USE_LOGGING) {
        log(
          'data',
          'Adapter mode selected',
          {
            mode: USE_MOCK_API ? 'MOCK' : 'REAL',
            strategy: USE_MOCK_API ? 'MockPaymentAdapter' : 'PaymentAdapter',
          },
          { feature: 'payment' },
        );
      }

      this.instance = USE_MOCK_API ? new MockPaymentAdapter() : new PaymentAdapter();
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
