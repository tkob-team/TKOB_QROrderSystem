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
  private baseUrl = '/api/v1/admin/kds'

  /**
   * Get all active KDS orders (flattened from priority groups)
   * GET /admin/kds/orders/active
   */
  async getKdsOrders(): Promise<KdsOrder[]> {
    const response = await api.get<{ data: KdsOrdersResponse }>(`${this.baseUrl}/orders/active`)
    const flattened = flattenPriorityOrders(response.data.data)
    return flattened
  }

  /**
   * Get KDS statistics
   * GET /admin/kds/stats
   */
  async getStats(): Promise<KdsStats> {
    const response = await api.get<{ data: KdsStatsResponse }>(`${this.baseUrl}/stats`)
    const stats = response.data.data
    return {
      totalActive: stats.totalActive,
      urgent: stats.urgent,
      high: stats.high,
      normal: stats.normal,
      avgPrepTime: stats.avgPrepTime,
      todayCompleted: stats.todayCompleted,
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
