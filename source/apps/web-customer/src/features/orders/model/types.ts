/**
 * Orders Feature - Type Definitions
 */

export type OrderStatus = 'Received' | 'Preparing' | 'Ready' | 'Completed'
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Failed'
export type PaymentMethod = 'card' | 'counter'

export type OrderItem = {
  id: string
  name: string
  quantity: number
  size?: string
  toppings?: string[]
  specialInstructions?: string
  price: number
}

export type Order = {
  id: string
  tableNumber?: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  items: OrderItem[]
  notes?: string
  subtotal: number
  tax: number
  serviceCharge: number
  total: number
  createdAt: string
  updatedAt: string
}

export type OrdersState = {
  currentOrder: Order | null
  currentSessionOrders: Order[]
  orderHistory: Order[]
  selectedOrder: Order | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null
}
