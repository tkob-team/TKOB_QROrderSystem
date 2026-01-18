/**
 * Orders Data Mappers
 * Maps between backend API types and frontend model types
 */

import type { OrderResponse, OrderItemResponse, OrderStatus as ApiOrderStatus } from './api/types'
import type { Order, OrderItem, OrderStatus, PaymentStatus } from '../model/types'

/**
 * Map API OrderStatus to frontend OrderStatus
 */
function mapOrderStatus(apiStatus: ApiOrderStatus): OrderStatus {
  const statusMap: Record<ApiOrderStatus, OrderStatus> = {
    PENDING: 'placed',
    RECEIVED: 'confirmed', // Staff accepted
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
    COMPLETED: 'completed',
    PAID: 'completed', // Orders that have been paid (after close table)
    CANCELLED: 'cancelled',
  }
  return statusMap[apiStatus] || 'placed'
}

/**
 * Map API PaymentStatus to frontend PaymentStatus
 */
function mapPaymentStatus(apiStatus: string): PaymentStatus {
  switch (apiStatus) {
    case 'COMPLETED':
      return 'paid'
    case 'REFUNDED':
      return 'refunded'
    default:
      return 'unpaid'
  }
}

/**
 * Map API OrderItem to frontend OrderItem
 */
function mapOrderItem(apiItem: OrderItemResponse): OrderItem {
  // Parse modifiers - backend may return string, array, or null
  let modifiers: string[] = [];
  if (apiItem.modifiers) {
    if (typeof apiItem.modifiers === 'string') {
      try {
        const parsed = JSON.parse(apiItem.modifiers);
        modifiers = Array.isArray(parsed) ? parsed.map((m: any) => m.name || String(m)) : [];
      } catch {
        modifiers = [];
      }
    } else if (Array.isArray(apiItem.modifiers)) {
      modifiers = apiItem.modifiers.map(m => m.name);
    }
  }
  
  return {
    name: apiItem.name,
    quantity: apiItem.quantity,
    price: apiItem.price,
    modifiers,
  }
}

/**
 * Map API OrderResponse to frontend Order
 */
export function mapOrderFromApi(apiOrder: OrderResponse): Order {
  const createdDate = new Date(apiOrder.createdAt)
  
  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    table: apiOrder.tableNumber,
    items: apiOrder.items.map(mapOrderItem),
    subtotal: apiOrder.subtotal,
    tax: apiOrder.tax,
    total: apiOrder.total,
    paymentStatus: mapPaymentStatus(apiOrder.paymentStatus),
    orderStatus: mapOrderStatus(apiOrder.status as ApiOrderStatus),
    time: createdDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    date: createdDate.toLocaleDateString(),
    createdAt: apiOrder.createdAt,
    timeline: {
      placed: apiOrder.createdAt ? formatTimelineTime(apiOrder.createdAt) : undefined,
      confirmed: apiOrder.receivedAt ? formatTimelineTime(apiOrder.receivedAt) : undefined,
      preparing: apiOrder.preparingAt ? formatTimelineTime(apiOrder.preparingAt) : undefined,
      ready: apiOrder.readyAt ? formatTimelineTime(apiOrder.readyAt) : undefined,
      served: apiOrder.servedAt ? formatTimelineTime(apiOrder.servedAt) : undefined,
      completed: apiOrder.completedAt ? formatTimelineTime(apiOrder.completedAt) : undefined,
      cancelled: apiOrder.cancelledAt ? formatTimelineTime(apiOrder.cancelledAt) : undefined,
    },
  }
}

/**
 * Format ISO date string to time string for timeline
 */
function formatTimelineTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * Map frontend OrderStatus back to API OrderStatus
 */
export function mapStatusToApi(frontendStatus: OrderStatus): ApiOrderStatus {
  const statusMap: Record<OrderStatus, ApiOrderStatus> = {
    placed: 'PENDING',
    confirmed: 'RECEIVED',
    preparing: 'PREPARING',
    ready: 'READY',
    served: 'SERVED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
  }
  return statusMap[frontendStatus]
}
