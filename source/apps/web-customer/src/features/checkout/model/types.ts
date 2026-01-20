/**
 * Checkout Feature - Type Definitions
 */

// Payment method types matching backend enum
// Note: In the new "Order now, pay later" flow, paymentMethod is always BILL_TO_TABLE by default
// Payment method selection happens at "Request Bill" time, not during checkout
export type PaymentMethod = 'BILL_TO_TABLE' | 'SEPAY_QR'

export type CheckoutFormData = {
  name: string
  notes: string
  // paymentMethod removed from checkout form - always defaults to BILL_TO_TABLE
  // Customer selects payment method when requesting bill, not during order placement
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
