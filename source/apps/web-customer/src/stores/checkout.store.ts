// Checkout store - manages checkout form state

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { log } from '@/shared/logging/logger'

// Payment method types matching backend enum
export type PaymentMethod = 'BILL_TO_TABLE' | 'SEPAY_QR';

// Tip percentage options (including 'custom' for custom amount)
export type TipPercent = 0 | 0.10 | 0.15 | 0.20 | 'custom';

interface CheckoutStore {
  customerName: string
  notes: string
  paymentMethod: PaymentMethod | null  // null = not selected yet
  tipPercent: TipPercent
  customTipAmount: number  // Custom tip dollar amount
  // FEAT-14: Discount fields
  discountCode: string
  discountApplied: boolean
  discountAmount: number
  setCustomerName: (name: string) => void
  setNotes: (notes: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setTipPercent: (percent: TipPercent) => void
  setCustomTipAmount: (amount: number) => void
  setDiscountCode: (code: string) => void
  setDiscountApplied: (applied: boolean) => void
  setDiscountAmount: (amount: number) => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      customerName: '',
      notes: '',
      paymentMethod: null, // User must select payment method
      tipPercent: 0, // Default: no tip
      customTipAmount: 0, // Default: no custom tip

      setCustomerName: (name) => {
        log('ui', 'Checkout name updated', { hasName: name.length > 0 }, { feature: 'checkout', dedupe: true, dedupeTtlMs: 3000 })
        set({ customerName: name })
      },

      setNotes: (notes) => {
        log('ui', 'Checkout notes updated', { hasNotes: notes.length > 0 }, { feature: 'checkout', dedupe: true, dedupeTtlMs: 3000 })
        set({ notes })
      },

      setPaymentMethod: (method) => {
        log('ui', 'Payment method selected', { paymentMethod: method }, { feature: 'checkout' })
        set({ paymentMethod: method })
      },

      setTipPercent: (percent) => {
        log('ui', 'Tip percent selected', { tipPercent: typeof percent === 'number' ? percent * 100 + '%' : 'custom' }, { feature: 'checkout' })
        set({ tipPercent: percent })
      },

      setCustomTipAmount: (amount) => {
        log('ui', 'Custom tip amount set', { amount: '$' + amount.toFixed(2) }, { feature: 'checkout' })
        set({ customTipAmount: amount, tipPercent: 'custom' })
      },

      // FEAT-14: Discount setters
      setDiscountCode: (code) => {
        log('ui', 'Discount code entered', { hasCode: code.length > 0 }, { feature: 'checkout' })
        set({ discountCode: code })
      },

      setDiscountApplied: (applied) => {
        log('ui', 'Discount applied status', { applied }, { feature: 'checkout' })
        set({ discountApplied: applied })
      },

      setDiscountAmount: (amount) => {
        log('ui', 'Discount amount set', { amount: '$' + amount.toFixed(2) }, { feature: 'checkout' })
        set({ discountAmount: amount })
      },

      reset: () => {
        log('ui', 'Checkout form reset', {}, { feature: 'checkout' })
        set({
          customerName: '',
          notes: '',
          paymentMethod: null,
          tipPercent: 0,
          customTipAmount: 0,
          discountCode: '',
          discountApplied: false,
          discountAmount: 0,
        })
      },
    }),
    {
      name: 'wc_checkout_draft_v2', // Bump version for new fields
    }
  )
)

