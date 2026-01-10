/**
 * Waiter Data Factory
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { waiterApi } from './api/api-waiter.adapter';
import { waiterMock } from './mocks/mock-waiter.adapter';
import type { IWaiterAdapter } from './adapter.interface';

function createWaiterAdapter(): IWaiterAdapter {
  const useMock = isMockEnabled('waiter');
  console.log('[WaiterFactory] Mock enabled:', useMock);
  return useMock ? waiterMock : waiterApi;
}

/**
 * Singleton instance
 */
export const waiterAdapter = createWaiterAdapter();
