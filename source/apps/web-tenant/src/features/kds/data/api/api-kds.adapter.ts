/**
 * KDS API Adapter
 * Real API implementation for Kitchen Display System
 */

import { api } from '@/services/axios'
import type { IKdsAdapter, KdsStats } from '../adapter.interface'
import type { KdsOrder } from '../../model/types'
import { flattenPriorityOrders } from '../mappers'
import type { KdsOrdersResponse, KdsStatsResponse } from './types'

/**
 * KDS API Service for kitchen staff
 * All endpoints require JWT authentication
 */
class KdsApiAdapter implements IKdsAdapter {
  private baseUrl = '/admin/kds'

  /**
   * Get all active KDS orders (flattened from priority groups)
   * GET /admin/kds/orders/active
   */
  async getKdsOrders(): Promise<KdsOrder[]> {
    const response = await api.get<KdsOrdersResponse>(`${this.baseUrl}/orders/active`)
    return flattenPriorityOrders(response.data)
  }

  /**
   * Get KDS statistics
   * GET /admin/kds/stats
   */
  async getStats(): Promise<KdsStats> {
    const response = await api.get<KdsStatsResponse>(`${this.baseUrl}/stats`)
    return {
      totalActive: response.data.totalActive,
      urgent: response.data.urgent,
      high: response.data.high,
      normal: response.data.normal,
      avgPrepTime: response.data.avgPrepTime,
      todayCompleted: response.data.todayCompleted,
    }
  }

  /**
   * Mark item as prepared
   * Uses order controller: PATCH /admin/orders/:orderId/items/:itemId/prepared
   */
  async markItemPrepared(orderId: string, itemId: string): Promise<void> {
    await api.patch(`/admin/orders/${orderId}/items/${itemId}/prepared`)
  }
}

// Singleton export
export const kdsApiAdapter = new KdsApiAdapter()

// Also export class for testing
export { KdsApiAdapter }
