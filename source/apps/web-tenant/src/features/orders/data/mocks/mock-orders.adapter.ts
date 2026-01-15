/**
 * Orders Mock Adapter
 * Mock data for development/testing
 */

import { INITIAL_ORDERS } from '../../model/constants';
import type { Order, OrderStatus } from '../../model/types';
import type { IOrdersAdapter, OrderApiFilters, PaginatedOrders } from '../adapter.interface';
import { logger } from '@/shared/utils/logger';
import { samplePayload } from '@/shared/utils/dataInspector';

const logFullDataEnabled =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

class MockOrdersAdapter implements IOrdersAdapter {
  async getOrders(filters?: OrderApiFilters): Promise<PaginatedOrders> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...INITIAL_ORDERS];
    
    // Apply filters
    if (filters?.status) {
      filtered = filtered.filter(o => o.orderStatus === filters.status);
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(o => 
        o.orderNumber.toLowerCase().includes(query) ||
        o.table.toLowerCase().includes(query)
      );
    }
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    
    return {
      data: paged,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }
  
  async getOrderById(id: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const order = INITIAL_ORDERS.find(o => o.id === id);
    return order || null;
  }
  
  async updateOrderStatus(id: string, status: OrderStatus, reason?: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'orders',
        op: 'status.update',
        payload: samplePayload({ id, status, reason }),
      });
    }
    const order = INITIAL_ORDERS.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    
    const updated = { ...order, orderStatus: status };
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'orders',
        op: 'status.update',
        data: samplePayload(updated),
      });
    }
    return updated;
  }
  
  async cancelOrder(id: string, reason: string): Promise<Order> {
    return this.updateOrderStatus(id, 'cancelled', reason);
  }
  
  async markItemPrepared(orderId: string, itemId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (logFullDataEnabled) {
      logger.info('[mock] KDS item prepared', { orderId, itemId });
    }
  }
}

export const ordersMock = new MockOrdersAdapter();
