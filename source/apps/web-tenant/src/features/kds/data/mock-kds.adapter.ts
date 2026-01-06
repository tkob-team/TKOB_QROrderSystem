/**
 * KDS Mock Adapter
 */

import { MOCK_KDS_ORDERS } from '../model/constants';

export const kdsMock = {
  async getKdsOrders() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_KDS_ORDERS;
  },
};
