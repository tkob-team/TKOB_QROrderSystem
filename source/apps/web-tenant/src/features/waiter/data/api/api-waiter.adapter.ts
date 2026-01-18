/**
 * Waiter API Adapter
 */

import { orderControllerGetOrders } from '@/services/generated/orders/orders';
import type { ServiceOrder, OrderStatus as WaiterOrderStatus, PaymentMethod } from '../../model/types';
import type { OrderResponseDto } from '@/services/generated/models';

/**
 * Map backend order status to waiter service board status
 */
function mapOrderStatus(backendStatus: string): WaiterOrderStatus | null {
  const statusMap: Record<string, WaiterOrderStatus> = {
    'PENDING': 'placed',
    'RECEIVED': 'confirmed',
    'PREPARING': 'preparing',
    'READY': 'ready',
    'SERVED': 'served',
    'COMPLETED': 'completed',
  };
  
  // PAID and CANCELLED orders should not be displayed in service board
  if (backendStatus === 'PAID' || backendStatus === 'CANCELLED') {
    return null;
  }
  
  return statusMap[backendStatus] || 'placed';
}

/**
 * Map backend payment method to waiter payment method
 */
function mapPaymentMethod(backendMethod: string): PaymentMethod {
  const methodMap: Record<string, PaymentMethod> = {
    'BILL_TO_TABLE': 'BILL_TO_TABLE',
    'SEPAY_QR': 'SEPAY_QR',
    'CARD_ONLINE': 'CARD_ONLINE',
  };
  return methodMap[backendMethod] || 'BILL_TO_TABLE';
}

/**
 * Map backend order to service order
 * Returns null if order should not be displayed (PAID/CANCELLED)
 */
function mapToServiceOrder(order: OrderResponseDto): ServiceOrder | null {
  const status = mapOrderStatus(order.status);
  
  // Filter out orders that shouldn't be displayed
  if (status === null) {
    return null;
  }
  
  const placedTime = new Date(order.createdAt);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - placedTime.getTime()) / 60000);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    table: order.tableNumber || 'Unknown',
    tableId: order.tableId, // UUID for API calls
    sessionId: (order as any).sessionId || undefined, // Session ID for grouping orders by table
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
    status,
    paymentStatus: order.paymentStatus === 'COMPLETED' ? 'paid' : 'unpaid',
    paymentMethod: mapPaymentMethod(order.paymentMethod),
    placedTime: placedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    minutesAgo,
    total: order.total,
  };
}

export const waiterApi = {
  async getServiceOrders(): Promise<ServiceOrder[]> {
    try {
      // Backend expects comma-separated string for status filter
      // Fetch active orders (not including PAID since those tables are closed)
      const response = await orderControllerGetOrders({
        status: 'PENDING,RECEIVED,PREPARING,READY,SERVED,COMPLETED',
        page: 1,
        limit: 100,
      });

      // Response is PaginatedResponseDto which has data property
      const orders = (response as any).data || response;
      if (!Array.isArray(orders)) return [];
      
      // Map and filter out null results (PAID/CANCELLED orders)
      return orders
        .map(mapToServiceOrder)
        .filter((order): order is ServiceOrder => order !== null);
    } catch (error) {
      console.error('[waiter] Failed to fetch service orders:', error);
      throw error;
    }
  },
};
