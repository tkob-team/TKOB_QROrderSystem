/**
 * Orders API Adapter
 * Real API implementation for admin/staff order management
 */

import { api } from '@/services/axios'
import type { IOrdersAdapter, OrderApiFilters, PaginatedOrders } from '../adapter.interface'
import type { Order, OrderStatus } from '../../model/types'
import type { OrderResponse, PaginatedOrdersResponse } from './types'
import { mapOrderFromApi, mapStatusToApi } from '../mappers'

/**
 * Orders API Service for tenant admin
 * All endpoints require JWT authentication
 */
class OrdersApiAdapter implements IOrdersAdapter {
  private baseUrl = '/admin'

  /**
   * Get orders with optional filters and pagination
   * GET /orders/admin/orders
   */
  async getOrders(filters?: OrderApiFilters): Promise<PaginatedOrders> {
    const params = new URLSearchParams()
    
    if (filters?.status) params.append('status', filters.status)
    if (filters?.tableId) params.append('tableId', filters.tableId)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get<PaginatedOrdersResponse>(
      `${this.baseUrl}/orders?${params.toString()}`
    )
    
    return {
      data: response.data.data.map(mapOrderFromApi),
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
    }
  }

  /**
   * Get single order by ID
   * GET /orders/admin/orders/:orderId
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await api.get<OrderResponse>(
        `${this.baseUrl}/orders/${orderId}`
      )
      return mapOrderFromApi(response.data)
    } catch {
      return null
    }
  }

  /**
   * Update order status
   * PATCH /orders/admin/orders/:orderId/status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    reason?: string
  ): Promise<Order> {
    const response = await api.patch<OrderResponse>(
      `${this.baseUrl}/orders/${orderId}/status`,
      { status: mapStatusToApi(status), reason }
    )
    return mapOrderFromApi(response.data)
  }

  /**
   * Cancel order
   * POST /orders/admin/orders/:orderId/cancel
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const response = await api.post<OrderResponse>(
      `${this.baseUrl}/orders/${orderId}/cancel`,
      { reason }
    )
    return mapOrderFromApi(response.data)
  }

  /**
   * Mark item as prepared (KDS)
   * PATCH /orders/admin/orders/:orderId/items/:itemId/prepared
   */
  async markItemPrepared(orderId: string, itemId: string): Promise<void> {
    await api.patch(`${this.baseUrl}/orders/${orderId}/items/${itemId}/prepared`)
  }
}

// Singleton export
export const ordersApi = new OrdersApiAdapter()

// Also export class for testing
export { OrdersApiAdapter }
