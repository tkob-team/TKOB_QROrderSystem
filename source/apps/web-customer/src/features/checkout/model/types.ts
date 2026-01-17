/**
 * Checkout Feature - Type Definitions
 */

// Payment method types matching backend enum
export type PaymentMethod = 'BILL_TO_TABLE' | 'SEPAY_QR'

export type CheckoutFormData = {
  name: string
  notes: string
  paymentMethod: PaymentMethod
}

export type CheckoutState = CheckoutFormData & {
  isSubmitting?: boolean
  error?: string
}
