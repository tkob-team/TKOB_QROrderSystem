// Order Tracking Types - matching backend API response

/**
 * Timeline step in order tracking
 */
export interface OrderTrackingTimelineStep {
  status: string
  label: string
  timestamp: string | null
  completed: boolean
  description?: string
}

/**
 * Order tracking response from GET /tracking/:orderId
 */
export interface OrderTrackingResponse {
  orderId: string
  orderNumber: string
  tableNumber: string
  currentStatus: string
  currentStatusMessage: string
  timeline: OrderTrackingTimelineStep[]
  estimatedTimeRemaining: number | null // minutes
  elapsedMinutes: number
  createdAt: string
}

/**
 * Order statuses for tracking display
 */
export type OrderTrackingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED'
