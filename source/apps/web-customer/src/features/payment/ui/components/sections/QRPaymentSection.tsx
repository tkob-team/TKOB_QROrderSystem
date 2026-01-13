import { Lock, QrCode, CheckCircle, Clock } from 'lucide-react'
import type { PaymentStatus } from '../../../model'
import { log } from '@/shared/logging/logger'

interface QRPaymentSectionProps {
  paymentStatus: PaymentStatus
  onStartPayment?: () => void
}

export function QRPaymentSection({ paymentStatus, onStartPayment }: QRPaymentSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 border text-center" style={{ borderColor: 'var(--gray-200)' }}>
      {/* Status Badge */}
      <div className="flex justify-center mb-4">
        {paymentStatus === 'waiting' && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--orange-100)', color: 'var(--orange-700)' }}>
            <Clock className="w-4 h-4" />
            <span style={{ fontSize: '14px' }}>Waiting for payment</span>
          </div>
        )}
        {paymentStatus === 'success' && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }}>
            <CheckCircle className="w-4 h-4" />
            <span style={{ fontSize: '14px' }}>Payment successful</span>
          </div>
        )}
      </div>

      {/* Label above QR */}
      <h3 className="mb-6" style={{ color: 'var(--gray-900)' }}>
        Scan to pay
      </h3>

      {/* Large QR Code Placeholder */}
      <div className="flex justify-center mb-6">
        <div
          className="rounded-2xl border-2 flex items-center justify-center relative"
          style={{
            borderColor: 'var(--gray-300)',
            backgroundColor: 'var(--gray-50)',
            width: '280px',
            height: '280px',
          }}
        >
          <QrCode className="w-48 h-48" style={{ color: 'var(--gray-400)' }} />
          {/* Success Overlay */}
          {paymentStatus === 'success' && (
            <div
              className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.95)' }}
            >
              <CheckCircle className="w-24 h-24" style={{ color: 'white' }} />
            </div>
          )}
        </div>
      </div>

      {/* Status Message below QR */}
      {paymentStatus === 'waiting' && (
        <>
          <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
            {process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' 
              ? 'In demo mode: Click the button below to simulate payment.'
              : 'Payment not completed yet. Please scan the QR code.'}
          </p>
          {/* MOCK-only: Allow simulating payment success explicitly */}
          {process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' && onStartPayment && (
            <button
              onClick={() => {
                log('ui', 'Simulate payment button clicked', {}, { feature: 'payment' });
                onStartPayment();
              }}
              className="px-6 py-2 rounded-full transition-all hover:shadow-sm active:scale-95"
              style={{ backgroundColor: 'var(--orange-500)', color: 'white', fontSize: '14px' }}
            >
              I&apos;ve Paid (Simulate Success)
            </button>
          )}
        </>
      )}
      {paymentStatus === 'success' && (
        <p style={{ color: 'var(--emerald-700)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
          Your payment has been processed successfully!
        </p>
      )}

      {/* Security note at bottom */}
      <div className="flex items-center justify-center gap-2 pt-6 mt-6 border-t" style={{ borderColor: 'var(--gray-200)' }}>
        <Lock className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
        <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
          Secure payment • QR-based
        </span>
      </div>
    </div>
  )
}
