/**
 * KDS Adapter Interface
 * Defines contract for KDS data operations
 */

import type { KdsOrder } from '../model/types';

export interface KdsStats {
  totalActive: number
  urgent: number
  high: number
  normal: number
  avgPrepTime?: number
  todayCompleted: number
}

export interface IKdsAdapter {
  /**
   * Get all active KDS orders (flattened from priority groups)
   */
  getKdsOrders(): Promise<KdsOrder[]>;
  
  /**
   * Get KDS statistics
   */
  getStats(): Promise<KdsStats>;
  
  /**
   * Mark item as prepared
   */
  markItemPrepared?(orderId: string, itemId: string): Promise<void>;
}
