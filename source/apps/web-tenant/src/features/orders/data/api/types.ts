// Orders API Types - matching backend DTOs

/**
 * Order item modifier
 */
export interface OrderItemModifier {
  id: string
  name: string
  price: number
}

/**
 * Order item response
 */
export interface OrderItemResponse {
  id: string
  name: string
  price: number
  quantity: number
  modifiers: OrderItemModifier[] | string  // Backend may return JSON string
  notes?: string
  itemTotal: number
  prepared: boolean
  preparedAt?: string
}

/**
 * Order response from admin endpoints
 */
export interface OrderResponse {
  id: string
  orderNumber: string
  tableId: string
  tableNumber: string
  customerName?: string
  customerNotes?: string
  status: OrderStatus
  priority: OrderPriority
  paymentMethod: string
  paymentStatus: PaymentStatus
  subtotal: number
  tax: number
  total: number
  items: OrderItemResponse[]
  estimatedPrepTime?: number
  actualPrepTime?: number
  elapsedPrepTime?: number
  createdAt: string
  receivedAt?: string
  preparingAt?: string
  readyAt?: string
  servedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancelReason?: string
}

/**
 * Order status enum
 */
export type OrderStatus = 
  | 'PENDING'
  | 'RECEIVED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'PAID'
  | 'CANCELLED'

/**
 * Order priority enum
 */
export type OrderPriority = 'NORMAL' | 'HIGH' | 'URGENT'

/**
 * Payment status enum
 */
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

/**
 * Order filters for list query
 */
export interface OrderFilters {
  status?: string
  tableId?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Update order status request
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus
  reason?: string
}

/**
 * Paginated response wrapper
 */
export interface PaginatedOrdersResponse {
  data: OrderResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}
