import { Lock, Receipt, CheckCircle, Clock, CreditCard } from 'lucide-react'
import type { PaymentStatus } from '../../../model'

interface QRPaymentSectionProps {
  paymentStatus: PaymentStatus
  onStartPayment?: () => void
}

/**
 * BUG-19 Fix: This section is for BILL_TO_TABLE payment method.
 * Removed old QR placeholder - BILL_TO_TABLE means pay the waiter at table,
 * not via QR. Show appropriate "Pay at Table" UI instead.
 */
export function QRPaymentSection({ paymentStatus, onStartPayment }: QRPaymentSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 border text-center" style={{ borderColor: 'var(--gray-200)' }}>
      {/* Status Badge */}
      <div className="flex justify-center mb-4">
        {paymentStatus === 'waiting' && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--orange-100)', color: 'var(--orange-700)' }}>
            <Clock className="w-4 h-4" />
            <span style={{ fontSize: '14px' }}>Awaiting payment</span>
          </div>
        )}
        {paymentStatus === 'success' && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }}>
            <CheckCircle className="w-4 h-4" />
            <span style={{ fontSize: '14px' }}>Payment completed</span>
          </div>
        )}
      </div>

      {/* Header */}
      <h3 className="mb-4" style={{ color: 'var(--gray-900)' }}>
        Pay at Table
      </h3>

      {/* Bill-to-Table Icon */}
      <div className="flex justify-center mb-6">
        <div
          className="rounded-2xl flex items-center justify-center relative"
          style={{
            backgroundColor: 'var(--gray-100)',
            width: '140px',
            height: '140px',
          }}
        >
          {paymentStatus === 'success' ? (
            <CheckCircle className="w-20 h-20" style={{ color: 'var(--emerald-500)' }} />
          ) : (
            <Receipt className="w-20 h-20" style={{ color: 'var(--gray-400)' }} />
          )}
        </div>
      </div>

      {/* Instructions */}
      {paymentStatus === 'waiting' && (
        <>
          <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            Your order has been placed. A waiter will bring your bill when you&apos;re ready to pay.
          </p>
          <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginBottom: '16px' }}>
            <CreditCard className="w-4 h-4 inline-block mr-1" style={{ verticalAlign: 'middle' }} />
            Pay by cash or card when the waiter arrives
          </p>
        </>
      )}
      {paymentStatus === 'success' && (
        <p style={{ color: 'var(--emerald-700)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
          Thank you! Your payment has been completed.
        </p>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 pt-6 mt-6 border-t" style={{ borderColor: 'var(--gray-200)' }}>
        <Lock className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
        <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
          Secure table-side payment
        </span>
      </div>
    </div>
  )
}

