// Orders feature data adapter interface

import { ApiResponse, Order, CartItem } from '@/types';

/**
 * Contract for orders data adapters
 * 
 * Defines all methods for order operations (create, retrieve, update)
 * Implemented by real adapters (API calls) and mock adapters (MSW handlers)
 */
export interface IOrdersAdapter {
  createOrder(data: {
    tableId: string;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    paymentMethod: 'card' | 'counter';
  }): Promise<ApiResponse<Order>>;

  getOrder(id: string): Promise<ApiResponse<Order>>;

  getOrderHistory(userId: string, sessionId?: string): Promise<ApiResponse<Order[]>>;

  updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>>;
}
