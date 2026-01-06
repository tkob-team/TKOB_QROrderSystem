/**
 * Waiter Mock Adapter
 */

import { SERVICE_BOARD_MOCK_ORDERS } from '../model/constants';

export const waiterMock = {
  async getServiceOrders() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return SERVICE_BOARD_MOCK_ORDERS;
  },
};
