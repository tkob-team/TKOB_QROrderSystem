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
  private baseUrl = '/api/v1/admin/orders'

  /**
   * Get orders with optional filters and pagination
   * GET /api/v1/admin/orders
   */
  async getOrders(filters?: OrderApiFilters): Promise<PaginatedOrders> {
    const params = new URLSearchParams()
    
    if (filters?.status) params.append('status', filters.status)
    if (filters?.tableId) params.append('tableId', filters.tableId)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get<PaginatedOrdersResponse>(
      `${this.baseUrl}?${params.toString()}`
    )
    
    // Backend response structure:
    // { success: true, data: { data: Order[], meta: {...} } }
    // response.data = { success, data: { data, meta } }
    const rawResponse = response.data as any;
    
    // Unwrap the success wrapper first
    const paginatedData = rawResponse?.data || rawResponse;
    
    // Now extract orders array and meta
    const orders = Array.isArray(paginatedData?.data) ? paginatedData.data : 
                   Array.isArray(paginatedData) ? paginatedData : [];
    const meta = paginatedData?.meta || {};
    
    return {
      data: orders.map(mapOrderFromApi),
      total: meta.totalItems || orders.length,
      page: meta.currentPage || 1,
      limit: meta.itemsPerPage || 20,
      totalPages: meta.totalPages || Math.ceil(orders.length / 20),
    }
  }

  /**
   * Get single order by ID
   * GET /api/v1/admin/orders/:orderId
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await api.get<OrderResponse>(
        `${this.baseUrl}/${orderId}`
      )
      return mapOrderFromApi(response.data)
    } catch {
      return null
    }
  }

  /**
   * Update order status
   * PATCH /api/v1/admin/orders/:orderId/status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    reason?: string
  ): Promise<Order> {
    const response = await api.patch<OrderResponse>(
      `${this.baseUrl}/${orderId}/status`,
      { status: mapStatusToApi(status), reason }
    )
    return mapOrderFromApi(response.data)
  }

  /**
   * Cancel order
   * POST /api/v1/admin/orders/:orderId/cancel
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const response = await api.post<OrderResponse>(
      `${this.baseUrl}/${orderId}/cancel`,
      { reason }
    )
    return mapOrderFromApi(response.data)
  }

  /**
   * Mark item as prepared (KDS)
   * PATCH /api/v1/admin/orders/:orderId/items/:itemId/prepared
   */
  async markItemPrepared(orderId: string, itemId: string): Promise<void> {
    await api.patch(`${this.baseUrl}/${orderId}/items/${itemId}/prepared`)
  }
}

// Singleton export
export const ordersApi = new OrdersApiAdapter()

// Also export class for testing
export { OrdersApiAdapter }
