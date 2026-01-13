/**
 * Orders Data Factory
 * Selects mock or real API adapter based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { ordersApi } from './api/api-orders.adapter';
import { ordersMock } from './mocks/mock-orders.adapter';
import type { IOrdersAdapter } from './adapter.interface';

function createOrdersAdapter(): IOrdersAdapter {
  const useMock = isMockEnabled('orders');
  console.log('[OrdersFactory] Mock enabled:', useMock);
  return useMock ? ordersMock : ordersApi;
}

/**
 * Singleton instance
 */
export const ordersAdapter = createOrdersAdapter();
