'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { OrdersDataFactory } from '@/features/orders/data'
import { orderQueryKeys } from '@/features/orders/data/cache/orderQueryKeys'
import { CardPaymentPage } from './CardPaymentPage'
import { SepayPaymentPage } from './SepayPaymentPage'
import { useCheckoutStore } from '@/stores/checkout.store'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'

/**
 * Payment page content component that uses useSearchParams().
 * Must be wrapped in Suspense boundary by parent component.
 * 
 * Routes to appropriate payment page based on paymentMethod:
 * - SEPAY_QR: VietQR payment with polling
 * - BILL_TO_TABLE: Legacy card payment simulation
 */
export function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  const orderId = searchParams.get('orderId') ?? ''
  const source = searchParams.get('source') ?? 'checkout' // 'order' or 'checkout'
  
  // Get payment method from URL or fallback to checkout store
  const paymentMethodParam = searchParams.get('paymentMethod')
  const checkoutPaymentMethod = useCheckoutStore((s) => s.paymentMethod)
  const paymentMethod = paymentMethodParam || checkoutPaymentMethod

  // Load order by orderId using Orders strategy
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: orderQueryKeys.order(orderId),
    queryFn: async () => {
      const startTime = Date.now()
      if (!orderId) return null;
      
      log('data', 'Order load for payment attempt', { orderId: maskId(orderId), source }, { feature: 'payment', dedupe: true, dedupeTtlMs: 10000 });
      
      const strategy = OrdersDataFactory.getStrategy();
      const response = await strategy.getOrder(orderId);
      
      if (response.success && response.data) {
        log('data', 'Order loaded for payment', { orderId: maskId(orderId), itemCount: response.data.items?.length || 0, total: response.data.total, paymentStatus: response.data.paymentStatus, durationMs: Date.now() - startTime }, { feature: 'payment' });
        return response.data;
      }
      
      logError('data', 'Order not found for payment', { orderId: maskId(orderId) }, { feature: 'payment' });
      return null;
    },
    enabled: !!orderId && mounted,
  });

  // Guard: If no orderId, show error and prevent payment
  useEffect(() => {
    setMounted(true);
    
    log('ui', 'Payment page mounted', { hasOrderId: !!orderId, orderId: maskId(orderId), source, paymentMethod }, { feature: 'payment', dedupe: true, dedupeTtlMs: 10000 });
  }, [orderId, source, paymentMethod])

  const handlePaymentSuccess = () => {
    log('ui', 'Payment success navigation', { orderId: maskId(orderId), source, target: 'orders-list' }, { feature: 'payment' });
    
    // BUG-13 fix: After payment success, always go to orders list
    // This allows user to see all their orders and continue ordering
    router.push('/orders');
  }

  const handlePaymentFailure = () => {
    logError('ui', 'Payment failed', { orderId: maskId(orderId), source }, { feature: 'payment' });
    // Stay on page; error will be shown by CardPaymentPage
  }

  const handleBack = () => {
    // BUG-13 fix: Navigate to order detail instead of back()
    // This allows user to track order and retry payment if needed
    if (orderId) {
      router.push(`/orders/${orderId}`)
    } else {
      router.push('/menu')
    }
  }

  const handleBackToCheckout = () => {
    router.push('/checkout')
  }

  const handleBackToMenu = () => {
    router.push('/menu')
  }

  // Error state: No orderId provided
  if (mounted && !orderId) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
            </button>
            <h2 style={{ color: 'var(--gray-900)' }}>Payment</h2>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-sm w-full text-center">
            <div className="mb-4" style={{ color: 'var(--red-600)', fontSize: '48px' }}>⚠️</div>
            <h3 style={{ color: 'var(--gray-900)', fontSize: '18px', marginBottom: '12px' }}>
              Invalid Payment Request
            </h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginBottom: '24px' }}>
              No order found. Please create an order from the checkout page first.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleBackToCheckout}
                className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  minHeight: '48px',
                  fontSize: '15px',
                }}
              >
                Back to Checkout
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full py-3 px-6 rounded-full border-2 transition-all hover:shadow-md active:scale-95"
                style={{
                  borderColor: 'var(--gray-300)',
                  color: 'var(--gray-900)',
                  minHeight: '48px',
                  fontSize: '15px',
                }}
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state while fetching order
  if (mounted && orderId && orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--orange-500)' }}></div>
          <p style={{ color: 'var(--gray-600)' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state: Order not found
  if (mounted && orderId && !orderLoading && !orderData) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
            </button>
            <h2 style={{ color: 'var(--gray-900)' }}>Payment</h2>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-sm w-full text-center">
            <div className="mb-4" style={{ color: 'var(--red-600)', fontSize: '48px' }}>⚠️</div>
            <h3 style={{ color: 'var(--gray-900)', fontSize: '18px', marginBottom: '12px' }}>
              Order Not Found
            </h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginBottom: '24px' }}>
              The order you&apos;re trying to pay for could not be found. Please check your orders or create a new one.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/orders')}
                className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  minHeight: '48px',
                  fontSize: '15px',
                }}
              >
                View My Orders
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full py-3 px-6 rounded-full border-2 transition-all hover:shadow-md active:scale-95"
                style={{
                  borderColor: 'var(--gray-300)',
                  color: 'var(--gray-900)',
                  minHeight: '48px',
                  fontSize: '15px',
                }}
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BUG-10: Prevent customer self-payment before order is ready
  // Only allow payment for orders in READY, SERVED, or COMPLETED status
  const allowedPaymentStatuses = ['READY', 'SERVED', 'COMPLETED', 'PAID'];
  const orderStatus = orderData?.status?.toUpperCase() || '';
  const isPaymentStatusAllowed = allowedPaymentStatuses.includes(orderStatus);
  
  if (mounted && orderData && !isPaymentStatusAllowed && paymentMethod === 'SEPAY_QR') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
            </button>
            <h2 style={{ color: 'var(--gray-900)' }}>Payment</h2>
          </div>
        </div>

        {/* Order Not Ready Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-sm w-full text-center">
            <div className="mb-4" style={{ color: 'var(--orange-500)', fontSize: '48px' }}>⏳</div>
            <h3 style={{ color: 'var(--gray-900)', fontSize: '18px', marginBottom: '12px' }}>
              Order Not Ready Yet
            </h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginBottom: '12px' }}>
              Your order is still being prepared. You can pay once your order is ready to serve.
            </p>
            <p style={{ color: 'var(--orange-600)', fontSize: '14px', marginBottom: '24px', fontWeight: 500 }}>
              Current status: {orderStatus || 'Processing'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  minHeight: '48px',
                  fontSize: '15px',
                }}
              >
                Track Order Status
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full py-3 px-6 rounded-full border-2 transition-all hover:shadow-md active:scale-95"
                style={{
                  borderColor: 'var(--gray-300)',
                  color: 'var(--gray-900)',
                  minHeight: '48px',
                  fontSize: '15px',
                }}
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Route to SePay payment for SEPAY_QR method
  if (paymentMethod === 'SEPAY_QR') {
    return <SepayPaymentPage />
  }

  // Default: Legacy card payment (BILL_TO_TABLE or fallback)
  return (
    <CardPaymentPage
      orderId={orderId}
      order={orderData}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentFailure={handlePaymentFailure}
      onBack={handleBack}
    />
  )
}
