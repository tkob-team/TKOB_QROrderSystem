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
  paymentMethod: PaymentMethod
  tipPercent: TipPercent
  customTipAmount: number  // Custom tip dollar amount
  setCustomerName: (name: string) => void
  setNotes: (notes: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setTipPercent: (percent: TipPercent) => void
  setCustomTipAmount: (amount: number) => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      customerName: '',
      notes: '',
      paymentMethod: 'BILL_TO_TABLE', // Default: pay at table
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

      reset: () => {
        log('ui', 'Checkout form reset', {}, { feature: 'checkout' })
        set({
          customerName: '',
          notes: '',
          paymentMethod: 'BILL_TO_TABLE',
          tipPercent: 0,
          customTipAmount: 0,
        })
      },
    }),
    {
      name: 'wc_checkout_draft_v2', // Bump version for new fields
    }
  )
)

