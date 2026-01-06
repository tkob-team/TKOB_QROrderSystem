/**
 * Orders Adapter Interface
 * Defines contract for orders data operations
 */

import type { Order } from '../model/types';

export interface IOrdersAdapter {
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(data: Partial<Order>): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
}
