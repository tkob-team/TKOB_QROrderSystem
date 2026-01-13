/**
 * Checkout Feature - Type Definitions
 */

export type PaymentMethod = 'card' | 'counter'

export type CheckoutFormData = {
  name: string
  notes: string
  paymentMethod: PaymentMethod
}

export type CheckoutState = CheckoutFormData & {
  isSubmitting?: boolean
  error?: string
}
