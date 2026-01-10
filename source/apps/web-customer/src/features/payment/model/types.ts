import type { Order } from '@/types'

export type PaymentStatus = 'waiting' | 'success' | 'failed'

export interface PaymentState {
  paymentStatus: PaymentStatus
  error: string | null
  total: number
  itemCount: number
  existingOrder?: Order | null
}

export interface PaymentActions {
  goBack: () => void
  handlePaymentSuccess: () => void
  handlePaymentFailure: () => void
  handleViewOrderStatus: () => void
  retryPayment: () => void
}

export interface PaymentController {
  state: PaymentState
  actions: PaymentActions
}
