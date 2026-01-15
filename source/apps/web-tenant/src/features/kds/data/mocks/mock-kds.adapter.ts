/**
 * KDS Mock Adapter
 * Implements IKdsAdapter for local development
 */

import type { IKdsAdapter, KdsStats } from '../adapter.interface'
import type { KdsOrder } from '../../model/types'
import { MOCK_KDS_ORDERS } from './mock-kds.data'

class MockKdsAdapter implements IKdsAdapter {
  private orders: KdsOrder[] = [...MOCK_KDS_ORDERS]

  async getKdsOrders(): Promise<KdsOrder[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return this.orders
  }

  async getStats(): Promise<KdsStats> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const pending = this.orders.filter(o => o.status === 'pending').length
    const preparing = this.orders.filter(o => o.status === 'preparing').length
    const ready = this.orders.filter(o => o.status === 'ready').length
    const served = this.orders.filter(o => o.status === 'served').length
    
    return {
      totalActive: pending + preparing + ready,
      urgent: this.orders.filter(o => o.isOverdue).length,
      high: this.orders.filter(o => o.time >= 10 && !o.isOverdue).length,
      normal: this.orders.filter(o => o.time < 10 && !o.isOverdue).length,
      avgPrepTime: 12,
      todayCompleted: 45 + served,
    }
  }

  async markItemPrepared(orderId: string, _itemId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Simulate item being marked prepared
    const order = this.orders.find(o => o.id === orderId)
    if (order && order.status === 'pending') {
      order.status = 'preparing'
      order.startedAt = new Date().toISOString()
    }
  }
}

// Singleton export
export const kdsMockAdapter = new MockKdsAdapter()

// Also export old name for backward compatibility
export const kdsMock = kdsMockAdapter

// Export class for testing
export { MockKdsAdapter }
