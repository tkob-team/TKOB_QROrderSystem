// Checkout store - manages checkout form state

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { log } from '@/shared/logging/logger'

interface CheckoutStore {
  customerName: string
  notes: string
  paymentMethod: 'card' | 'counter'
  setCustomerName: (name: string) => void
  setNotes: (notes: string) => void
  setPaymentMethod: (method: 'card' | 'counter') => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      customerName: '',
      notes: '',
      paymentMethod: 'counter',

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

      reset: () => {
        log('ui', 'Checkout form reset', {}, { feature: 'checkout' })
        set({
          customerName: '',
          notes: '',
          paymentMethod: 'counter',
        })
      },
    }),
    {
      name: 'wc_checkout_draft_v1',
    }
  )
)
