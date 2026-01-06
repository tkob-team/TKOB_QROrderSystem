/**
 * Orders Data Factory
 * Selects mock or real API adapter based on feature flags
 */

import { isMockEnabled } from '@/shared/config/featureFlags';
import { ordersApi } from './api-orders.adapter';
import { ordersMock } from './mock-orders.adapter';
import type { IOrdersAdapter } from './orders-adapter.interface';

function createOrdersAdapter(): IOrdersAdapter {
  const useMock = isMockEnabled('orders');
  console.log('[OrdersFactory] Mock enabled:', useMock);
  return useMock ? ordersMock : ordersApi;
}

/**
 * Singleton instance
 */
export const ordersAdapter = createOrdersAdapter();
