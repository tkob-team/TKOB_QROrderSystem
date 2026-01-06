/**
 * Orders Mock Adapter
 * Mock data for development/testing
 */

import { INITIAL_ORDERS } from '../model/constants';
import type { Order } from '../model/types';

export const ordersMock = {
  async getOrders(): Promise<Order[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return INITIAL_ORDERS;
  },
  
  async getOrderById(id: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const order = INITIAL_ORDERS.find(o => o.id === id);
    return order || null;
  },
  
  async createOrder(data: Partial<Order>): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `#${Math.floor(Math.random() * 9000) + 1000}`,
      ...data,
    } as Order;
    return newOrder;
  },
  
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const order = INITIAL_ORDERS.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return { ...order, status } as Order;
  },
};
