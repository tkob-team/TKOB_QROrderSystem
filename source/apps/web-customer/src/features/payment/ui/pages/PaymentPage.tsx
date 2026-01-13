'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { OrdersDataFactory } from '@/features/orders/data'
import { CardPaymentPage } from './CardPaymentPage'
import { debugOrder } from '@/features/orders/dev/orderDebug'

export function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  const orderId = searchParams.get('orderId') ?? ''
  const source = searchParams.get('source') ?? 'checkout' // 'order' or 'checkout'

  // Load order by orderId using Orders strategy
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      debugOrder('payment-start', {
        orderId,
        source,
        callsite: 'PaymentPage.queryFn',
      });
      
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.log('[Payment Page] Loading order:', orderId);
      }
      
      const strategy = OrdersDataFactory.getStrategy();
      const response = await strategy.getOrder(orderId);
      
      if (response.success && response.data) {
        debugOrder('read-order-detail', {
          orderId,
          total: response.data.total,
          itemCount: response.data.items?.length || 0,
          paymentStatus: response.data.paymentStatus,
          callsite: 'PaymentPage.queryFn',
        });
        
        if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
          console.log('[Payment Page] Order loaded:', response.data.id, '- Items:', response.data.items?.length || 0, '- Total:', response.data.total);
        }
        return response.data;
      }
      
      debugOrder('read-order-detail', {
        orderId,
        status: 'failed',
        reason: 'Order not found',
        callsite: 'PaymentPage.queryFn',
      });
      
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.warn('[Payment Page] Order not found:', orderId);
      }
      return null;
    },
    enabled: !!orderId && mounted,
  });

  // Guard: If no orderId, show error and prevent payment
  useEffect(() => {
    setMounted(true);
    
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[Payment Page] Mounted with orderId:', orderId || '(missing)');
    }
  }, [orderId])

  const handlePaymentSuccess = () => {
    debugOrder('payment-success-navigation', {
      orderId,
      source,
      navigatingTo: source === 'order' ? `/orders/${orderId}?paid=1` : `/payment/success?orderId=${orderId}`,
      callsite: 'PaymentPage.handlePaymentSuccess',
    });
    
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[Payment Page] Payment success, source:', source);
    }
    
    // If paying from order detail/list, redirect back to order detail
    if (source === 'order' && orderId) {
      router.push(`/orders/${orderId}?paid=1`);
    } else {
      // If paying from checkout (new order), show order confirmation page
      router.push(`/payment/success${orderId ? `?orderId=${orderId}` : ''}`);
    }
  }

  const handlePaymentFailure = () => {
    debugOrder('payment-failed', {
      orderId,
      source,
      callsite: 'PaymentPage.handlePaymentFailure',
    });
    
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      console.log('[Payment Page] Payment failed');
    }
    // Stay on page; error will be shown by CardPaymentPage
  }

  const handleBack = () => {
    router.back()
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
