// Mock Order Strategy - returns mock data

import { orderHandlers } from '@/api/mocks';
import { ApiResponse, Order, CartItem } from '@/types';
import { IOrderStrategy } from '../interfaces';

export class MockOrderStrategy implements IOrderStrategy {
  async createOrder(data: {
    tableId: string;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    paymentMethod: 'card' | 'counter';
  }): Promise<ApiResponse<Order>> {
    return orderHandlers.createOrder(data);
  }
  
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return orderHandlers.getOrder(id);
  }
  
  async getOrderHistory(userId: string): Promise<ApiResponse<Order[]>> {
    return orderHandlers.getOrderHistory(userId);
  }
  
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    return orderHandlers.updateOrderStatus(orderId, status);
  }
}
