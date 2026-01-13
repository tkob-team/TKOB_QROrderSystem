/**
 * Waiter Adapter Interface
 * Defines contract for waiter service board data operations
 */

import type { ServiceOrder } from '../model/types';

export interface IWaiterAdapter {
  getServiceOrders(): Promise<ServiceOrder[]>;
}
