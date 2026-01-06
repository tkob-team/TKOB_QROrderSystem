/**
 * KDS Adapter Interface
 * Defines contract for KDS data operations
 */

import type { KdsOrder } from '../model/types';

export interface IKdsAdapter {
  getKdsOrders(): Promise<KdsOrder[]>;
}
