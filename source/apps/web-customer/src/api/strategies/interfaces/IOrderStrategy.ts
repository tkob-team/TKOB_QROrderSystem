// Order strategy interface

import { ApiResponse, Order, CartItem } from '@/types';

export interface IOrderStrategy {
  createOrder(data: {
    tableId: string;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    paymentMethod: 'card' | 'counter';
  }): Promise<ApiResponse<Order>>;
  
  getOrder(id: string): Promise<ApiResponse<Order>>;
  
  getOrderHistory(userId: string): Promise<ApiResponse<Order[]>>;
  
  updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>>;
}
