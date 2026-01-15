/**
 * Orders Adapter for Customer App
 * 
 * NOTE: Customer ordering uses CheckoutApiService (/checkout endpoint)
 * This adapter is for order tracking/history AFTER checkout
 * Backend wraps responses in { success: true, data: ... }
 */

import apiClient from '@/api/client';
import { Order, CartItem, ApiResponse } from '@/types';
import { IOrdersAdapter } from '../adapter.interface';

export class OrdersAdapter implements IOrdersAdapter {
  /**
   * Get current order by ID (customer tracking)
   * @param id Order ID
   */
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  }

  /**
   * Get orders for current table (session cookie auto-included)
   * Returns all orders for this table session
   */
  async getTableOrders(): Promise<Order[]> {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>(`/orders/table`);
    return response.data.data;
  }

  /**
   * Get order tracking info (timeline + ETA)
   * @param orderId Order ID
   */
  async getOrderTracking(orderId: string): Promise<unknown> {
    const response = await apiClient.get(`/tracking/${orderId}`);
    return response.data.data;
  }

  /**
   * Deprecated: OrdersAdapter.createOrder is not used for checkout
   * Use CheckoutApiService.checkout() instead
   * @deprecated Use CheckoutApiService
   */
  async createOrder(_data: {
    tableId: string;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    paymentMethod: 'card' | 'counter';
  }): Promise<ApiResponse<Order>> {
    throw new Error('[DEPRECATED] Use CheckoutApiService.checkout() instead of OrdersAdapter.createOrder()');
  }

  /**
   * Deprecated: Not used in customer flow
   * @deprecated
   */
  async getOrderHistory(_userId: string, _sessionId?: string): Promise<ApiResponse<Order[]>> {
    throw new Error('[DEPRECATED] Use getTableOrders() instead');
  }

  /**
   * Deprecated: Customer cannot update order status directly
   * @deprecated
   */
  async updateOrderStatus(_orderId: string, _status: Order['status']): Promise<ApiResponse<Order>> {
    throw new Error('[DEPRECATED] Order status updates are handled by backend only');
  }
}
