/**
 * Waiter Data Factory
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { logger } from '@/shared/utils/logger';
import { waiterApi } from './api/api-waiter.adapter';
import { waiterMock } from './mocks/mock-waiter.adapter';
import type { IWaiterAdapter } from './adapter.interface';

function createWaiterAdapter(): IWaiterAdapter {
  const useMock = isMockEnabled('waiter');
  
  if (typeof window !== 'undefined') {
    logger.info('[data] ADAPTER_MODE', { feature: 'waiter', mode: useMock ? 'MOCK' : 'REAL_API' });
  }
  
  return useMock ? waiterMock : waiterApi;
}

/**
 * Singleton instance
 */
export const waiterAdapter = createWaiterAdapter();
