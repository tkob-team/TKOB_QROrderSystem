/**
 * KDS Data Mappers
 * Maps between backend API types and frontend KDS model types
 */

import type { OrderResponse } from '../../orders/data/api/types'
import type { KdsOrder, KdsStatus, OrderItem } from '../model/types'

/**
 * Map API OrderStatus to KDS Status
 */
function mapToKdsStatus(apiStatus: string): KdsStatus {
  switch (apiStatus) {
    case 'PENDING':
    case 'RECEIVED':
      return 'pending'
    case 'PREPARING':
      return 'preparing'
    case 'READY':
      return 'ready'
    case 'SERVED':
    case 'COMPLETED':
      return 'served'
    default:
      return 'pending'
  }
}

/**
 * Calculate elapsed time in minutes from createdAt
 */
function calculateElapsedMinutes(createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / 60000)
}

/**
 * Map API OrderItemResponse to KDS OrderItem
 */
function mapOrderItem(apiItem: OrderResponse['items'][0]): OrderItem {
  // Parse modifiers - backend returns JSON string, not array
  let modifiers: string[] = []
  
  if (apiItem.modifiers) {
    try {
      // If it's a string, parse it
      const parsedModifiers = typeof apiItem.modifiers === 'string' 
        ? JSON.parse(apiItem.modifiers) 
        : apiItem.modifiers
      
      // Extract modifier names/optionNames
      modifiers = Array.isArray(parsedModifiers)
        ? parsedModifiers.map((m: any) => m.optionName || m.name || '').filter(Boolean)
        : []
    } catch (e) {
      console.error('[KDS_DEBUG] Failed to parse modifiers:', apiItem.modifiers, e)
      modifiers = []
    }
  }

  return {
    name: apiItem.name,
    quantity: apiItem.quantity,
    modifiers,
    notes: apiItem.notes,
  }
}

/**
 * Map API OrderResponse to KDS KdsOrder
 */
export function mapOrderToKds(apiOrder: OrderResponse): KdsOrder {
  const elapsedMinutes = calculateElapsedMinutes(apiOrder.createdAt)
  const estimatedTime = apiOrder.estimatedPrepTime || 15 // default 15 min
  const isOverdue = elapsedMinutes > estimatedTime
  
  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    table: apiOrder.tableNumber,
    time: elapsedMinutes,
    items: apiOrder.items.map(mapOrderItem),
    isOverdue,
    status: mapToKdsStatus(apiOrder.status),
    startedAt: apiOrder.preparingAt,
    readyAt: apiOrder.readyAt,
    servedAt: apiOrder.servedAt,
    servedBy: undefined, // Not tracked in API response
    createdAt: apiOrder.createdAt,
  }
}

/**
 * Flatten priority-grouped orders into single array
 */
export function flattenPriorityOrders(
  orders: { normal: OrderResponse[]; high: OrderResponse[]; urgent: OrderResponse[] }
): KdsOrder[] {
  console.log('[FLATTEN_DEBUG] Input orders:', orders)
  console.log('[FLATTEN_DEBUG] orders.urgent:', orders.urgent)
  console.log('[FLATTEN_DEBUG] orders.high:', orders.high)
  console.log('[FLATTEN_DEBUG] orders.normal:', orders.normal)
  
  // Urgent first, then high, then normal
  const result = [
    ...orders.urgent.map(mapOrderToKds),
    ...orders.high.map(mapOrderToKds),
    ...orders.normal.map(mapOrderToKds),
  ]
  
  console.log('[FLATTEN_DEBUG] Result length:', result.length)
  console.log('[FLATTEN_DEBUG] Result:', result)
  
  return result
}
