'use client'

import { useState } from 'react'
import { Clock, Flag, Loader2, ReceiptText } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { ORDERS_TEXT } from '../../model'
import { ReviewModal } from '../components/modals/ReviewModal'
import { VerifyEmailRequiredModal } from '@/features/auth/ui/components/modals/VerifyEmailRequiredModal'
import { RequestBillButton } from '../components/sections/RequestBillButton'

interface OrderTrackingPageProps {
  orderId?: string
}

export function OrderTrackingPage({ orderId }: OrderTrackingPageProps) {
  const { language } = useLanguage()
  const t = ORDERS_TEXT[language]
  const [isBillRequested, setIsBillRequested] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(true)

  const handleBillRequested = () => {
    setIsBillRequested(true)
  }

  const handleSubmitReview = ({ rating, comment }: { rating: number; comment: string }) => {
    // Hook up to API once available
    console.log('Submitting review', { rating, comment, orderId })
    setShowReviewModal(false)
  }

  const handleLeaveReview = () => {
    if (!isEmailVerified) {
      setShowVerifyModal(true)
      return
    }
    setShowReviewModal(true)
  }

  const handleVerifyEmail = () => {
    setIsEmailVerified(true)
    setShowVerifyModal(false)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="p-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--gray-900)' }}>
            {t.trackingOrder}
          </h2>
          <p style={{ color: 'var(--gray-600)' }}>Tracking order {orderId ?? '#'}...</p>
        </div>

        <div className="bg-white rounded-2xl border p-4 space-y-4" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--orange-500)' }} />
            <div>
              <p className="font-semibold" style={{ color: 'var(--gray-900)' }}>
                Order in progress
              </p>
              <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
                We will notify you when your order is ready.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!isBillRequested ? (
              <RequestBillButton
                orderId={orderId}
                onRequested={handleBillRequested}
              />
            ) : null}
            <button
              type="button"
              onClick={handleLeaveReview}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
            >
              <Flag className="w-4 h-4" />
              Leave a review
            </button>
          </div>


        </div>
      </div>

      <ReviewModal
        open={showReviewModal}
        itemName={orderId ? `Order ${orderId}` : 'Your order'}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
      />

      <VerifyEmailRequiredModal
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerifyEmail={handleVerifyEmail}
      />
    </div>
  )
}
