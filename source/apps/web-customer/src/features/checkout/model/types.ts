/**
 * Checkout Feature - Type Definitions
 */

// Payment method types matching backend enum
export type PaymentMethod = 'BILL_TO_TABLE' | 'SEPAY_QR'

export type CheckoutFormData = {
  name: string
  notes: string
  paymentMethod: PaymentMethod
  // Voucher/discount fields
  discountCode?: string | null
  discountApplied?: boolean
  discountAmount?: number
  promotionId?: string | null
}

export type CheckoutState = CheckoutFormData & {
  isSubmitting?: boolean
  error?: string
}
