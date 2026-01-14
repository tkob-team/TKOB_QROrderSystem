// Real Orders Adapter for feature

import apiClient from '@/api/client';
import { ApiResponse, Order, CartItem } from '@/types';
import { IOrdersAdapter } from '../adapter.interface';

export class OrdersAdapter implements IOrdersAdapter {
  async createOrder(data: {
    tableId: string;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    paymentMethod: 'card' | 'counter';
  }): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<{ success: boolean; data: ApiResponse<Order> }>('/api/orders', data);
    return response.data.data;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<{ success: boolean; data: ApiResponse<Order> }>(`/api/orders/${id}`);
    return response.data.data;
  }

  async getOrderHistory(userId: string, sessionId?: string): Promise<ApiResponse<Order[]>> {
    const response = await apiClient.get<{ success: boolean; data: ApiResponse<Order[]> }>(`/api/orders/history/${userId}`);
    return response.data.data;
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    const response = await apiClient.patch<{ success: boolean; data: ApiResponse<Order> }>(`/api/orders/${orderId}/status`, { status });
    return response.data.data;
  }
}
