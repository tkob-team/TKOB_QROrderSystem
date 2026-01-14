// Orders data layer types

import { ApiResponse, Order, CartItem } from '@/types';

export interface IOrdersStrategy {
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
