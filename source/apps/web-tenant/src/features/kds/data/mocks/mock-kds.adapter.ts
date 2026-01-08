/**
 * KDS Mock Adapter
 */

import { MOCK_KDS_ORDERS } from './mock-kds.data';

export const kdsMock = {
  async getKdsOrders() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_KDS_ORDERS;
  },
};
