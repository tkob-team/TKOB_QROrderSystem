// Auth feature data factory

import { USE_MOCK_API } from '@/shared/config';
import { log } from '@/shared/logging/logger';
import { IAuthAdapter } from './adapter.interface';
import { MockAuthAdapter } from './mocks/auth.adapter';
import { AuthAdapter } from './api/auth.adapter';

/**
 * Feature-owned factory for auth data adapters
 */
const USE_LOGGING = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';

export class AuthDataFactory {
  private static instance: IAuthAdapter;

  static getStrategy(): IAuthAdapter {
    if (!this.instance) {
      if (USE_LOGGING) {
        log(
          'data',
          'Adapter mode selected',
          {
            mode: USE_MOCK_API ? 'MOCK' : 'REAL',
            strategy: USE_MOCK_API ? 'MockAuthAdapter' : 'AuthAdapter',
          },
          { feature: 'auth' },
        );
      }

      this.instance = USE_MOCK_API ? new MockAuthAdapter() : new AuthAdapter();
    }
    return this.instance;
  }

  static reset(): void {
    delete (this as any).instance;
  }
}
