// Order store - manages UI/session state for orders (not server data)
// Server data (order lists, details) stays in React Query

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { log } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'

type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | null

interface OrderStore {
  // Currently active order ID (last created/viewed)
  activeOrderId: string | null
  
  // Last payment result status
  lastPaymentStatus: PaymentStatus
  
  // When this order was last seen (for tracking "new order" vs "returning")
  lastSeenAt: number | null
  
  // Actions
  setActiveOrder: (orderId: string, context?: string) => void
  setPaymentStatus: (status: PaymentStatus, orderId?: string) => void
  updateLastSeen: () => void
  reset: () => void
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      activeOrderId: null,
      lastPaymentStatus: null,
      lastSeenAt: null,

      setActiveOrder: (orderId, context = 'unknown') => {
        log('ui', 'Active order updated', { orderId: maskId(orderId), context }, { feature: 'orders' })
        set({ 
          activeOrderId: orderId,
          lastSeenAt: Date.now()
        })
      },

      setPaymentStatus: (status, orderId) => {
        const currentOrderId = orderId || get().activeOrderId
        log('ui', 'Payment status updated', { 
          status, 
          orderId: maskId(currentOrderId || 'none') 
        }, { feature: 'orders' })
        set({ lastPaymentStatus: status })
      },

      updateLastSeen: () => {
        set({ lastSeenAt: Date.now() })
      },

      reset: () => {
        log('ui', 'Order store reset', {}, { feature: 'orders' })
        set({
          activeOrderId: null,
          lastPaymentStatus: null,
          lastSeenAt: null,
        })
      },
    }),
    {
      name: 'wc_order_session_v1',
    }
  )
)
