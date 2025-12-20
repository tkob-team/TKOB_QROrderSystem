// Order service - handles order creation and management
// Refactored to use Strategy Pattern

import { StrategyFactory } from '@/api/strategies';
import { ApiResponse, Order, CartItem } from '@/types';

// Create strategy instance (mock or real based on API_MODE)
const orderStrategy = StrategyFactory.createOrderStrategy();

export const OrderService = {
  /**
   * Create new order
   */
  async createOrder(data: {
    tableId: string;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    paymentMethod: 'card' | 'counter';
  }): Promise<ApiResponse<Order>> {
    return orderStrategy.createOrder(data);
  },
  
  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return orderStrategy.getOrder(id);
  },
  
  /**
   * Get order history for user
   */
  async getOrderHistory(userId: string): Promise<ApiResponse<Order[]>> {
    return orderStrategy.getOrderHistory(userId);
  },
  
  /**
   * Update order status (for testing/admin)
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<ApiResponse<Order>> {
    return orderStrategy.updateOrderStatus(orderId, status);
  },
};
