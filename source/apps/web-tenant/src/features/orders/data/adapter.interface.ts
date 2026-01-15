/**
 * Orders Adapter Interface
 * Defines contract for orders data operations
 */

import type { Order, OrderStatus } from '../model/types';

/**
 * API filter params
 */
export interface OrderApiFilters {
  status?: string
  tableId?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Paginated response
 */
export interface PaginatedOrders {
  data: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IOrdersAdapter {
  /**
   * Get orders with optional filters and pagination
   */
  getOrders(filters?: OrderApiFilters): Promise<PaginatedOrders>;
  
  /**
   * Get single order by ID
   */
  getOrderById(id: string): Promise<Order | null>;
  
  /**
   * Update order status
   */
  updateOrderStatus(id: string, status: OrderStatus, reason?: string): Promise<Order>;
  
  /**
   * Cancel order with reason
   */
  cancelOrder(id: string, reason: string): Promise<Order>;
  
  /**
   * Mark item as prepared (KDS)
   */
  markItemPrepared?(orderId: string, itemId: string): Promise<void>;
}
