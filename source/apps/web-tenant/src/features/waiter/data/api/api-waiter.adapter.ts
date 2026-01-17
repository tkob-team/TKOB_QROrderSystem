/**
 * Waiter API Adapter
 */

import { orderControllerGetOrders } from '@/services/generated/orders/orders';
import type { ServiceOrder, OrderStatus as WaiterOrderStatus } from '../../model/types';
import type { OrderResponseDto } from '@/services/generated/models';

/**
 * Map backend order status to waiter service board status
 */
function mapOrderStatus(backendStatus: string): WaiterOrderStatus {
  const statusMap: Record<string, WaiterOrderStatus> = {
    'PENDING': 'placed',
    'RECEIVED': 'confirmed',
    'PREPARING': 'preparing',
    'READY': 'ready',
    'SERVED': 'served',
    'COMPLETED': 'completed',
  };
  return (statusMap[backendStatus] as WaiterOrderStatus) || 'placed';
}

/**
 * Map backend order to service order
 */
function mapToServiceOrder(order: OrderResponseDto): ServiceOrder {
  const placedTime = new Date(order.createdAt);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - placedTime.getTime()) / 60000);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    table: order.tableNumber || 'Unknown',
    items: order.items.map(item => {
      // Parse modifiers from JSON string to array
      let modifiers: string[] = [];
      if (item.modifiers) {
        try {
          const parsed = typeof item.modifiers === 'string' 
            ? JSON.parse(item.modifiers) 
            : item.modifiers;
          modifiers = Array.isArray(parsed) 
            ? parsed.map((m: any) => m.optionName || m.name || String(m)) 
            : [];
        } catch (e) {
          console.warn('[waiter] Failed to parse modifiers for item:', item.name, e);
        }
      }
      
      return {
        name: item.name,
        quantity: item.quantity,
        modifiers,
      };
    }),
    status: mapOrderStatus(order.status),
    paymentStatus: order.paymentStatus === 'PAID' ? 'paid' : 'unpaid',
    placedTime: placedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    minutesAgo,
    total: order.total,
  };
}

export const waiterApi = {
  async getServiceOrders(): Promise<ServiceOrder[]> {
    try {
      // Backend expects comma-separated string for status filter
      const response = await orderControllerGetOrders({
        status: 'PENDING,RECEIVED,PREPARING,READY,SERVED',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        page: 1,
        limit: 100,
      });

      return response.data.map(mapToServiceOrder);
    } catch (error) {
      console.error('[waiter] Failed to fetch service orders:', error);
      throw error;
    }
  },
};
