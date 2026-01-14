'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { useCart } from '@/shared/hooks/useCart'
import { log } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { Order } from '@/types/order'
import { useOrder } from '../../hooks/queries'
import { ORDERS_TEXT } from '../../model'
import { OrderStatusTimeline } from '../components/OrderStatusTimeline'
import { useOrderStore } from '@/stores/order.store'

interface OrderConfirmationPageProps {
  orderId?: string
}

export function OrderConfirmationPage({ orderId: propOrderId }: OrderConfirmationPageProps) {
  const router = useRouter()
  const { language } = useLanguage()
  const { clearCart } = useCart()
  const t = ORDERS_TEXT[language]
  
  // Fallback: use active order from store if no orderId provided
  const activeOrderId = useOrderStore((state) => state.activeOrderId)
  const updateLastSeen = useOrderStore((state) => state.updateLastSeen)
  const resetOrderStore = useOrderStore((state) => state.reset)
  const orderId = propOrderId || activeOrderId || ''

  // Fetch order details
  const { order, isLoading, error } = useOrder(orderId)

  // Update last seen timestamp when viewing confirmation
  useEffect(() => {
    if (orderId) {
      updateLastSeen()
    }
  }, [orderId, updateLastSeen])

  // Clear cart when order is confirmed (for both card and counter payments)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_LOGGING) {
      log('ui', 'Order confirmation page mounted - clearing cart', { orderId: maskId(orderId || '') }, { feature: 'orders' })
    }
    clearCart()
  }, [clearCart, orderId])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--orange-500)' }}></div>
          <p className="mt-4" style={{ color: 'var(--gray-600)' }}>Loading order...</p>
        </div>
      </div>
    )
  }

  // Error or not found state
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center max-w-md px-4">
          <h2 className="mb-4" style={{ color: 'var(--gray-900)' }}>Order not found</h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: '24px' }}>
            {error || 'The order you are looking for could not be found.'}
          </p>
          <button
            onClick={() => {
              resetOrderStore()
              router.push('/menu')
            }}
            className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            Back to menu
          </button>
        </div>
      </div>
    )
  }

  // Default ETA if missing
  const estimatedMinutes = 18

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Success Hero Section */}
      <div className="bg-white border-b p-6 text-center" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--emerald-100)' }}>
            <CheckCircle className="w-10 h-10" style={{ color: 'var(--emerald-500)' }} />
          </div>
        </div>
        <h1 className="mb-2" style={{ color: 'var(--gray-900)' }}>
          {t.orderConfirmed}
        </h1>
        <p className="mb-2" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
          Order ID #{order.id} {order.tableNumber && `· Table ${order.tableNumber}`}
        </p>
        <div className="flex items-center justify-center gap-2" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
          <Clock className="w-4 h-4" />
          <span>Estimated time {estimatedMinutes} minutes</span>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="p-4 space-y-4">
          {/* Status Timeline */}
          <div className="bg-white rounded-xl p-4" style={{ borderWidth: '1px', borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-4" style={{ color: 'var(--gray-900)' }}>
              Order status
            </h3>
            <OrderStatusTimeline currentStatus={order.status} />
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl p-4" style={{ borderWidth: '1px', borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-4" style={{ color: 'var(--gray-900)' }}>
              Order details
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => {
                // Calculate item price based on selected size or base price
                let itemPrice = item.menuItem.basePrice
                if (item.selectedSize && item.menuItem.sizes) {
                  const sizeOption = item.menuItem.sizes.find((s) => s.size === item.selectedSize)
                  if (sizeOption) itemPrice = sizeOption.price
                }
                
                // Add topping prices
                if (item.selectedToppings.length > 0 && item.menuItem.toppings) {
                  item.selectedToppings.forEach((toppingId) => {
                    const topping = item.menuItem.toppings?.find((t) => t.id === toppingId)
                    if (topping) itemPrice += topping.price
                  })
                }
                
                const totalPrice = itemPrice * item.quantity
                
                return (
                  <div key={item.id} className="flex justify-between" style={{ fontSize: '14px' }}>
                    <div className="flex-1">
                      <div style={{ color: 'var(--gray-900)' }}>
                        {item.quantity} × {item.menuItem.name}
                      </div>
                      {(item.selectedSize || item.selectedToppings.length > 0 || item.specialInstructions) && (
                        <div style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                          {item.selectedSize && <span>{item.selectedSize}</span>}
                          {item.selectedToppings.length > 0 && (
                            <span>
                              {item.selectedSize && ' · '}
                              {item.selectedToppings.map((toppingId) => {
                                const topping = item.menuItem.toppings?.find((t) => t.id === toppingId)
                                return topping?.name
                              }).filter(Boolean).join(', ')}
                            </span>
                          )}
                          {item.specialInstructions && (
                            <div className="mt-1 italic">Note: {item.specialInstructions}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ color: 'var(--gray-900)' }}>
                      ${totalPrice.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t pt-3 mt-3 space-y-1" style={{ borderColor: 'var(--gray-200)', fontSize: '14px' }}>
              <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
                <span>Service charge</span>
                <span>${order.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}>
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details (if available) */}
          {order.notes && (
            <div className="bg-white rounded-xl p-4" style={{ borderWidth: '1px', borderColor: 'var(--gray-200)' }}>
              <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
                Special instructions
              </h3>
              <div style={{ fontSize: '14px', color: 'var(--gray-900)' }}>
                {order.notes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar - Stacked Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="max-w-[480px] mx-auto space-y-2">
          <button
            onClick={() => router.push(orderId ? `/orders/${orderId}` : '/orders')}
            className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
              fontSize: '15px',
            }}
          >
            Track order
          </button>
          <button
            onClick={() => {
              resetOrderStore()
              router.push('/menu')
            }}
            className="w-full py-3 px-6 rounded-full transition-all hover:bg-[var(--gray-100)] active:scale-95"
            style={{
              backgroundColor: 'white',
              color: 'var(--orange-500)',
              borderWidth: '2px',
              borderColor: 'var(--orange-500)',
              minHeight: '48px',
              fontSize: '15px',
            }}
          >
            Back to menu
          </button>
          <p className="text-center pt-1" style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
            You can always track your order from the Orders tab
          </p>
        </div>
      </div>
    </div>
  )
}
