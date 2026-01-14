'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { log } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { OrdersDataFactory } from '../../data'
import { orderQueryKeys } from '../../data/cache/orderQueryKeys'
import type { Order as ApiOrder } from '@/types/order'
import { ORDERS_TEXT } from '../../model'
import { isLiveOrder } from '../../model/statusUtils'
import { usePaymentVerification } from '../../hooks/usePaymentVerification'
import { OrderHeader } from '../components/sections/OrderHeader'
import { PaymentBanner } from '../components/sections/PaymentBanner'
import { OrderSummary } from '../components/sections/OrderSummary'
import { useOrderStore } from '@/stores/order.store'

interface OrderDetailPageProps {
  orderId: string
}

export function OrderDetailPage({ orderId: propOrderId }: OrderDetailPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const t = ORDERS_TEXT[language]
  
  // Fallback: use active order from store if no orderId provided
  const activeOrderId = useOrderStore((state) => state.activeOrderId)
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)
  const updateLastSeen = useOrderStore((state) => state.updateLastSeen)
  const orderId = propOrderId || activeOrderId || ''
  
  // Track this as active order when viewing
  useEffect(() => {
    if (orderId) {
      setActiveOrder(orderId, 'order-detail')
      updateLastSeen()
    }
  }, [orderId, setActiveOrder, updateLastSeen])

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: orderQueryKeys.order(orderId),
    queryFn: async () => {
      const strategy = OrdersDataFactory.getStrategy()
      log('data', 'Fetching order detail', { orderId: maskId(orderId) }, { feature: 'orders' });
      const resp = await strategy.getOrder(orderId)
      const apiOrder = resp.data as ApiOrder | undefined
      if (!apiOrder) {
        throw new Error('Order not found')
      }
      return apiOrder
    },
  })

  // Payment verification hook - handles ?paid=1 param and banner display
  const { showPaymentBanner } = usePaymentVerification({
    orderId,
    searchParams,
    refetch,
  });

  const isLive = order ? isLiveOrder(order) : false

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <OrderHeader orderId={orderId} />

      <div className="p-4">
        {/* Payment Success Banner */}
        <PaymentBanner 
          show={showPaymentBanner} 
          isPaid={order?.paymentStatus === 'Paid'} 
        />
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <p style={{ color: 'var(--gray-600)' }}>Loading order...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-white rounded-xl p-8 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
            <p style={{ color: 'var(--gray-900)' }}>Order not found</p>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginTop: '8px' }}>
              This order could not be found. It may have expired.
            </p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-6 px-6 py-2 rounded-full"
              style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
            >
              Back to orders
            </button>
          </div>
        )}
        
        {/* Order Content */}
        {order && (
          <div className="space-y-4">
            <OrderSummary order={order} isLive={isLive} />
          </div>
        )}
      </div>
    </div>
  )
}
