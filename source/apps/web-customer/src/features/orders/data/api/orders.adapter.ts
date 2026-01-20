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

// Session Bill Types
export interface SessionBillPreview {
  orders: Order[];
  summary: {
    subtotal: number;
    tax: number;
    serviceCharge: number;
    total: number;
    orderCount: number;
    itemCount: number;
  };
  tableNumber: string;
  sessionStartedAt: string;
}

export interface RequestBillResponse {
  success: boolean;
  message: string;
  sessionId: string;
  tableNumber: string;
  requestedAt: string;
  totalAmount: number;
  orderCount: number;
}

export interface CancelBillResponse {
  success: boolean;
  message: string;
  sessionId: string;
}

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
   * Note: Session is fetched from backend API using HttpOnly cookie
   */
  async getTableOrders(): Promise<Order[]> {
    // Fetch session from backend (uses HttpOnly cookie table_session_id)
    // This is cleaner than reading localStorage - single source of truth
    const sessionResponse = await apiClient.get<{ success: boolean; data: { tableId: string } }>('/session');
    const tableId = sessionResponse.data.data.tableId;
    
    if (!tableId) {
      throw new Error('Table ID not found in session');
    }
    
    const response = await apiClient.get<{ success: boolean; data: Order[] }>(
      `/orders/table/${tableId}`
    );
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

  // ===== SESSION BILL METHODS (New "Order now, pay later" flow) =====

  /**
   * Get bill preview for current session
   * Returns all orders and summary for the session
   */
  async getSessionBillPreview(): Promise<SessionBillPreview> {
    const response = await apiClient.get<{ success: boolean; data: SessionBillPreview }>(
      '/orders/session/bill-preview'
    );
    return response.data.data;
  }

  /**
   * Request bill for current session
   * Locks the session - no more orders can be placed
   * Notifies staff to bring the bill
   */
  async requestSessionBill(): Promise<RequestBillResponse> {
    const response = await apiClient.post<{ success: boolean; data: RequestBillResponse }>(
      '/orders/session/request-bill'
    );
    return response.data.data;
  }

  /**
   * Cancel bill request for current session
   * Unlocks the session - customer can order more
   */
  async cancelSessionBillRequest(): Promise<CancelBillResponse> {
    const response = await apiClient.post<{ success: boolean; data: CancelBillResponse }>(
      '/orders/session/cancel-bill-request'
    );
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

// Export singleton for direct use
export const orderApi = new OrdersAdapter();
