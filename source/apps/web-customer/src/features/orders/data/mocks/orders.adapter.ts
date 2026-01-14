// Mock Orders Adapter for feature

import { orderHandlers } from '@/api/mocks';
import { ApiResponse, Order, CartItem } from '@/types';
import { IOrdersAdapter } from '../adapter.interface';

export class MockOrdersAdapter implements IOrdersAdapter {
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

  async getOrderHistory(userId: string, sessionId?: string): Promise<ApiResponse<Order[]>> {
    return orderHandlers.getOrderHistory(userId, sessionId);
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    return orderHandlers.updateOrderStatus(orderId, status);
  }
}
