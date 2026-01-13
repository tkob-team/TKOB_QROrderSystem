'use client'

import { ArrowLeft, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { OrdersDataFactory } from '../../data'
import type { Order as ApiOrder } from '@/types/order'
import { ORDERS_TEXT } from '../../model'
import { RequestBillButton } from '../components/sections/RequestBillButton'
import { OrderStatusTimeline } from '../components/OrderStatusTimeline'
import { debugOrder } from '../../dev/orderDebug'

interface OrderDetailPageProps {
  orderId: string
}

// Determine if order is "live/current" (tracking mode) vs "history" (detail mode)
const isLiveOrder = (order: ApiOrder): boolean => {
  // Live orders: not Completed and not Cancelled
  return order.status !== 'Completed' && order.status !== 'Cancelled'
}

const getStatusMessage = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'Your order has been submitted and is awaiting confirmation.'
    case 'Accepted':
      return 'The restaurant has accepted your order and will begin preparing it soon.'
    case 'Preparing':
      return 'Your order is currently being prepared by the kitchen.'
    case 'Ready':
      return 'Your order is ready for pickup!'
    case 'Served':
      return 'Your order has been served to your table.'
    case 'Completed':
      return 'Your order has been completed. Enjoy your meal!'
    default:
      return 'Your order is in progress.'
  }
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const t = ORDERS_TEXT[language]
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [paymentSuccessShownRef, setPaymentSuccessShownRef] = useState(false)

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const strategy = OrdersDataFactory.getStrategy()
      if (process.env.NEXT_PUBLIC_DEBUG_ORDERS === 'true') {
        console.log('[Orders] getOrderById', orderId)
      }
      const resp = await strategy.getOrder(orderId)
      const apiOrder = resp.data as ApiOrder | undefined
      if (!apiOrder) {
        throw new Error('Order not found')
      }
      return apiOrder
    },
  })

  // Handle payment success: if ?paid=1 exists, refetch order and show banner only if actually paid
  useEffect(() => {
    const paid = searchParams.get('paid')
    if (paid === '1' && !paymentSuccessShownRef) {
      debugOrder('read-order-detail', {
        orderId,
        event: 'Detected ?paid=1 param, refetching',
        callsite: 'OrderDetailPage.useEffect',
      });
      
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.log('[OrderDetail] Detected ?paid=1, refetching order to verify payment status')
      }
      
      // Refetch to get latest order state from storage
      refetch().then((result) => {
        if (result.data && result.data.paymentStatus === 'Paid') {
          // Payment is confirmed as Paid - show banner and mark as shown
          setPaymentSuccessShownRef(true)
          setShowPaymentSuccess(true)
          
          debugOrder('payment-success-navigation', {
            orderId,
            paymentStatus: result.data.paymentStatus,
            verificationResult: 'Confirmed as Paid',
            callsite: 'OrderDetailPage.useEffect',
          });
          
          // Remove the query param
          const url = new URL(window.location.href)
          url.searchParams.delete('paid')
          window.history.replaceState({}, '', url.toString())
          
          if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
            console.log('[OrderDetail] Order confirmed as Paid, showing success banner')
          }
          
          // Auto-hide banner after 5 seconds
          const timer = setTimeout(() => {
            setShowPaymentSuccess(false)
          }, 5000)
          return () => clearTimeout(timer)
        } else if (result.data) {
          // Payment not yet reflected in storage, remove param and don't show banner
          debugOrder('payment-success-navigation', {
            orderId,
            paymentStatus: result.data.paymentStatus,
            verificationResult: 'NOT confirmed as Paid',
            callsite: 'OrderDetailPage.useEffect',
          });
          
          if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
            console.log('[OrderDetail] Order paymentStatus is', result.data.paymentStatus, '- not showing success banner')
          }
          const url = new URL(window.location.href)
          url.searchParams.delete('paid')
          window.history.replaceState({}, '', url.toString())
        }
      })
    }
  }, [searchParams, refetch, paymentSuccessShownRef])

  const isLive = order ? isLiveOrder(order) : false

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <h2 style={{ color: 'var(--gray-900)' }}>Order #{orderId}</h2>
        </div>
      </div>

      <div className="p-4">
        {/* Payment Success Banner - Only show if order is actually PAID */}
        {showPaymentSuccess && order && order.paymentStatus === 'Paid' && (
          <div 
            className="mb-4 bg-white rounded-xl p-4 border-2 animate-in fade-in slide-in-from-top-2 duration-300"
            style={{ borderColor: 'var(--emerald-500)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--emerald-100)' }}
              >
                <CheckCircle className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
              </div>
              <div className="flex-1">
                <p style={{ color: 'var(--emerald-900)', fontWeight: 500, fontSize: '15px' }}>
                  Payment successful!
                </p>
                <p style={{ color: 'var(--emerald-700)', fontSize: '13px' }}>
                  Your order is now paid and will be prepared shortly.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="text-center py-8">
            <p style={{ color: 'var(--gray-600)' }}>Loading order...</p>
          </div>
        )}
        
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
        
{order && (
          <div className="space-y-4">
            {/* LIVE ORDER (Tracking Mode) */}
            {isLive && (
              <>
                {/* Current Status Card */}
                <div className="bg-white rounded-xl p-6 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
                  <div className="flex justify-center mb-4">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--emerald-100)' }}
                    >
                      <Clock className="w-10 h-10" style={{ color: 'var(--emerald-600)' }} />
                    </div>
                  </div>
                  <h3 className="mb-2" style={{ color: 'var(--gray-900)' }}>
                    {order.status}
                  </h3>
                  <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                    {getStatusMessage(order.status)}
                  </p>
                  {order.status !== 'Ready' && order.status !== 'Completed' && (
                    <div className="flex items-center justify-center gap-2 mt-3" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                      <Clock className="w-4 h-4" />
                      <span>Estimated time: 18 minutes</span>
                    </div>
                  )}
                </div>

                {/* Unpaid Banner */}
                {(order.paymentStatus === 'Unpaid' || order.paymentStatus === 'Failed') && (
                  <div 
                    className="bg-white rounded-xl p-4 border" 
                    style={{ borderColor: 'var(--orange-300)', backgroundColor: 'var(--orange-50)' }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--orange-600)' }} />
                      <div className="flex-1">
                        <h4 className="mb-1" style={{ color: 'var(--orange-900)', fontSize: '15px' }}>
                          Payment pending
                        </h4>
                        <p style={{ color: 'var(--orange-700)', fontSize: '13px' }}>
                          This order is unpaid. Please complete payment to finalize.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
                          console.log('[OrderDetail] Navigate to payment for order:', orderId)
                        }
                        router.push(`/payment?orderId=${orderId}&source=order`)
                      }}
                      className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-95"
                      style={{
                        backgroundColor: 'var(--orange-500)',
                        color: 'white',
                        minHeight: '48px',
                      }}
                    >
                      Pay now ${order.total.toFixed(2)}
                    </button>
                  </div>
                )}

                {/* Request Bill Button */}
                <RequestBillButton 
                  orderId={orderId}
                  orderStatus={order.status}
                  paymentStatus={order.paymentStatus}
                  onRequested={() => {
                    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
                      console.log('[OrderDetail] Bill requested for order:', orderId)
                    }
                  }}
                />

                {/* Timeline */}
                <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
                  <h3 className="mb-4" style={{ color: 'var(--gray-900)' }}>
                    Order timeline
                  </h3>
                  <OrderStatusTimeline currentStatus={order.status} />
                  <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--blue-50)' }}>
                    <p style={{ color: 'var(--blue-700)', fontSize: '13px' }}>
                      💡 This page updates automatically. No need to refresh.
                    </p>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
                  <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
                    Your order
                  </h3>
                  <div className="space-y-3" style={{ fontSize: '14px' }}>
                    {order.items.map((item) => (
                      <div key={item.id}>
                        <div className="flex justify-between items-start gap-3">
                          <span style={{ color: 'var(--gray-700)' }}>
                            {item.quantity} × {item.menuItem.name}
                          </span>
                        </div>
                        {(item.selectedSize || item.selectedToppings?.length > 0) && (
                          <div style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '4px' }}>
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                            {item.selectedToppings && item.selectedToppings.length > 0 && ` · Toppings: ${item.selectedToppings.map(id => {
                              const topping = item.menuItem.toppings?.find(t => t.id === id)
                              return topping?.name
                            }).filter(Boolean).join(', ')}`}
                          </div>
                        )}
                        {item.specialInstructions && (
                          <div style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '4px' }}>
                            Notes: {item.specialInstructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 mt-3 flex justify-between" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}>
                    <span>Total</span>
                    <span style={{ fontWeight: '600' }}>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            {/* HISTORY ORDER (Detail Mode) */}
            {!isLive && (
              <>
                {/* Order Summary Card */}
                <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--gray-600)' }}>Order ID</span>
                      <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>{order.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--gray-600)' }}>Status</span>
                      <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>{order.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--gray-600)' }}>Payment</span>
                      <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>{order.paymentStatus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--gray-600)' }}>Items</span>
                      <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>{order.items.length}</span>
                    </div>
                    <div className="pt-3 border-t" style={{ borderColor: 'var(--gray-200)' }}>
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>Total</span>
                        <span style={{ color: 'var(--orange-500)', fontWeight: '600', fontSize: '18px' }}>
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Breakdown Card */}
                <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
                  <h3 style={{ color: 'var(--gray-900)', fontWeight: '500', marginBottom: '12px' }}>
                    Pricing Breakdown
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Subtotal</span>
                      <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Tax (10%)</span>
                      <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Service (5%)</span>
                      <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>${order.serviceCharge.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Items Card */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
                    <h3 style={{ color: 'var(--gray-900)', fontWeight: '500', marginBottom: '12px' }}>
                      Items ({order.items.length})
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item) => {
                        // Calculate item price
                        let itemPrice = item.menuItem.basePrice
                        if (item.selectedSize && item.menuItem.sizes) {
                          const sizeOption = item.menuItem.sizes.find(s => s.size === item.selectedSize)
                          if (sizeOption) itemPrice = sizeOption.price
                        }
                        if (item.selectedToppings?.length > 0 && item.menuItem.toppings) {
                          item.selectedToppings.forEach(toppingId => {
                            const topping = item.menuItem.toppings?.find(t => t.id === toppingId)
                            if (topping) itemPrice += topping.price
                          })
                        }
                        const totalPrice = itemPrice * item.quantity
                        
                        return (
                          <div key={item.id} className="pb-3 border-b" style={{ borderColor: 'var(--gray-100)' }}>
                            <div className="flex items-center justify-between mb-1">
                              <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>
                                {item.menuItem.name}
                              </span>
                              <span style={{ color: 'var(--orange-500)', fontWeight: '500' }}>
                                ${totalPrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                                Qty: {item.quantity}
                                {item.selectedSize && ` · Size: ${item.selectedSize}`}
                              </span>
                            </div>
                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                              <div style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '4px' }}>
                                Toppings: {item.selectedToppings.map(id => {
                                  const topping = item.menuItem.toppings?.find(t => t.id === id)
                                  return topping?.name
                                }).filter(Boolean).join(', ')}
                              </div>
                            )}
                            {item.specialInstructions && (
                              <div style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '4px' }}>
                                Notes: {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
