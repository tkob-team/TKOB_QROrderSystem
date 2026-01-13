/**
 * Waiter Mock Adapter
 */

import { MOCK_SERVICE_ORDERS } from './mock-waiter.data';

export const waiterMock = {
  async getServiceOrders() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_SERVICE_ORDERS;
  },
};
