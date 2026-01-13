/**
 * Orders Mock Adapter
 * Mock data for development/testing
 */

import { INITIAL_ORDERS } from '../../model/constants';
import type { Order } from '../../model/types';
import { logger } from '@/shared/utils/logger';
import { samplePayload } from '@/shared/utils/dataInspector';

const logFullDataEnabled =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

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
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'orders',
        op: 'create',
        payload: samplePayload(data),
      });
    }
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `#${Math.floor(Math.random() * 9000) + 1000}`,
      ...data,
    } as Order;
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'orders',
        op: 'create',
        data: samplePayload(newOrder),
      });
    }
    return newOrder;
  },
  
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'orders',
        op: 'status.update',
        payload: samplePayload({ id, status }),
      });
    }
    const order = INITIAL_ORDERS.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    const updated = { ...order, status } as Order;
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'orders',
        op: 'status.update',
        data: samplePayload(updated),
      });
    }
    return updated;
  },
};
