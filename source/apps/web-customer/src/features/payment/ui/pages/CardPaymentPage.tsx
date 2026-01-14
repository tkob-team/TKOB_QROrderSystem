'use client'

import type { Order } from '@/types'
import { usePaymentController } from '../../hooks'
import {
  ErrorMessageSection,
  OrderContextSection,
  PaymentHeader,
  QRPaymentSection,
  StickyActionBar,
  SummarySection,
} from '../components/sections'

interface CardPaymentProps {
  orderId?: string
  order?: Order | null
  onBack?: () => void
  onPaymentSuccess?: () => void
  onPaymentFailure?: () => void
}

export function CardPaymentPage({
  orderId,
  order,
  onBack,
  onPaymentSuccess,
  onPaymentFailure,
}: CardPaymentProps) {
  const { state, actions } = usePaymentController({
    orderId,
    order,
    onPaymentSuccess,
    onPaymentFailure,
  })

  const handleBack = onBack || actions.goBack

  // Fallback: If order not provided, show error
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
        <PaymentHeader onBack={handleBack} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p style={{ color: 'var(--red-600)', fontSize: '16px' }}>
              Unable to load order data for payment
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      <PaymentHeader onBack={handleBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* Order Context Section - Always show (derived from order snapshot) */}
          <OrderContextSection existingOrder={order} />

          {/* Error Message */}
          {state.error && <ErrorMessageSection error={state.error} />}

          {/* QR Payment Section */}
          <QRPaymentSection paymentStatus={state.paymentStatus} onStartPayment={actions.startPayment} />
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <StickyActionBar
        paymentStatus={state.paymentStatus}
        onViewOrderStatus={actions.handleViewOrderStatus}
        onRetry={handleBack}
      />
    </div>
  )
}
