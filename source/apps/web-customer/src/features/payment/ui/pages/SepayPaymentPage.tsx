'use client'

import { ArrowLeft, QrCode, CheckCircle, Clock, XCircle, RefreshCw, AlertCircle, Loader2, Lock } from 'lucide-react'
import { useSepayPaymentController, type SepayPaymentStatus } from '../../hooks'

/**
 * SePay Payment Page - displays VietQR code for payment
 * Uses polling to check payment status until completed/expired
 */
export function SepayPaymentPage() {
  const {
    status,
    error,
    paymentIntent,
    timeRemaining,
    pollingProgress,
    pollingAttempt,
    pollingMaxAttempts,
    retryPayment,
    goToOrderTracking,
    goBack,
  } = useSepayPaymentController()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <h2 style={{ color: 'var(--gray-900)', fontWeight: 600 }}>SePay Payment</h2>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* Main Payment Card */}
          <div className="bg-white rounded-xl p-6 border text-center" style={{ borderColor: 'var(--gray-200)' }}>
            {/* Status Badge */}
            <StatusBadge 
              status={status} 
              timeRemaining={timeRemaining}
              pollingAttempt={pollingAttempt}
              pollingMaxAttempts={pollingMaxAttempts}
            />

            {/* Payment Content based on status */}
            {status === 'loading' && <LoadingState />}
            {(status === 'waiting' || status === 'processing') && paymentIntent && (
              <QRCodeDisplay
                qrCodeUrl={paymentIntent.qrCodeUrl}
                amount={paymentIntent.amount}
                timeRemaining={timeRemaining}
                isPolling={status === 'processing'}
                pollingProgress={pollingProgress}
                pollingAttempt={pollingAttempt}
                pollingMaxAttempts={pollingMaxAttempts}
              />
            )}
            {status === 'success' && <SuccessState />}
            {status === 'failed' && <FailedState error={error} onRetry={retryPayment} />}
            {status === 'expired' && <ExpiredState onRetry={retryPayment} />}

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 pt-6 mt-6 border-t" style={{ borderColor: 'var(--gray-200)' }}>
              <Lock className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
              <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                Secured by SePay • VietQR
              </span>
            </div>
          </div>

          {/* Instructions */}
          {status === 'waiting' && <PaymentInstructions />}
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <StickyActionBar
        status={status}
        onViewOrder={goToOrderTracking}
        onRetry={retryPayment}
        onBack={goBack}
      />
    </div>
  )
}

// === Sub-components ===

function StatusBadge({ 
  status, 
  timeRemaining,
  pollingAttempt,
  pollingMaxAttempts,
}: { 
  status: SepayPaymentStatus
  timeRemaining: number
  pollingAttempt?: number
  pollingMaxAttempts?: number
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex justify-center mb-4">
      {status === 'loading' && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-600)' }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span style={{ fontSize: '14px' }}>Preparing payment...</span>
        </div>
      )}
      {status === 'waiting' && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--orange-100)', color: 'var(--orange-700)' }}>
          <Clock className="w-4 h-4" />
          <span style={{ fontSize: '14px' }}>
            Expires in {formatTime(timeRemaining)}
          </span>
        </div>
      )}
      {status === 'processing' && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--blue-100)', color: 'var(--blue-700)' }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span style={{ fontSize: '14px' }}>
            Verifying payment... {pollingAttempt !== undefined && pollingMaxAttempts !== undefined && `(${pollingAttempt}/${pollingMaxAttempts})`}
          </span>
        </div>
      )}
      {status === 'success' && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }}>
          <CheckCircle className="w-4 h-4" />
          <span style={{ fontSize: '14px' }}>Payment successful</span>
        </div>
      )}
      {status === 'failed' && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--red-100)', color: 'var(--red-700)' }}>
          <XCircle className="w-4 h-4" />
          <span style={{ fontSize: '14px' }}>Payment failed</span>
        </div>
      )}
      {status === 'expired' && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--amber-100)', color: 'var(--amber-700)' }}>
          <AlertCircle className="w-4 h-4" />
          <span style={{ fontSize: '14px' }}>Payment expired</span>
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <>
      <h3 className="mb-6" style={{ color: 'var(--gray-900)' }}>
        Creating payment request...
      </h3>
      <div className="flex justify-center mb-6">
        <div
          className="rounded-2xl border-2 flex items-center justify-center"
          style={{
            borderColor: 'var(--gray-300)',
            backgroundColor: 'var(--gray-50)',
            width: '280px',
            height: '280px',
          }}
        >
          <Loader2 className="w-16 h-16 animate-spin" style={{ color: 'var(--orange-500)' }} />
        </div>
      </div>
      <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
        Please wait while we prepare your payment QR code...
      </p>
    </>
  )
}

function QRCodeDisplay({
  qrCodeUrl,
  amount,
  timeRemaining: _timeRemaining,
  isPolling = false,
  pollingProgress = 0,
  pollingAttempt = 0,
  pollingMaxAttempts = 60,
}: {
  qrCodeUrl: string
  amount: number
  timeRemaining: number
  isPolling?: boolean
  pollingProgress?: number
  pollingAttempt?: number
  pollingMaxAttempts?: number
}) {
  // Format amount with Vietnamese Dong
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <>
      <h3 className="mb-2" style={{ color: 'var(--gray-900)' }}>
        {isPolling ? 'Verifying payment...' : 'Scan to pay'}
      </h3>
      <p className="mb-4" style={{ color: 'var(--orange-600)', fontSize: '24px', fontWeight: 700 }}>
        {formatVND(amount)}
      </p>

      {/* Polling Progress Bar - above QR code */}
      {isPolling && (
        <div className="mb-4 px-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--blue-700)', fontSize: '13px' }}>
              Checking payment... ({pollingAttempt}/{pollingMaxAttempts})
            </span>
            <span style={{ color: 'var(--blue-600)', fontSize: '12px' }}>
              ~{Math.ceil((pollingMaxAttempts - pollingAttempt) * 3 / 60)} min left
            </span>
          </div>
          <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--blue-100)' }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${pollingProgress}%`,
                backgroundColor: 'var(--blue-500)',
              }}
            />
          </div>
        </div>
      )}

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div
          className="rounded-2xl border-2 flex items-center justify-center p-4 bg-white"
          style={{
            borderColor: isPolling ? 'var(--blue-300)' : 'var(--orange-200)',
            width: '280px',
            height: '280px',
          }}
        >
          {/* Use qrCodeUrl from backend - SePay QR image URL */}
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCodeUrl}
              alt="VietQR Payment Code"
              className="w-full h-full object-contain"
            />
          ) : (
            // Fallback placeholder if no URL
            <div className="flex flex-col items-center justify-center w-full h-full">
              <QrCode className="w-32 h-32 mb-2" style={{ color: 'var(--gray-400)' }} />
              <p style={{ color: 'var(--gray-500)', fontSize: '12px', textAlign: 'center' }}>
                QR code loading...
              </p>
            </div>
          )}
        </div>
      </div>

      <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.5' }}>
        {isPolling 
          ? "We're checking your payment. You can still scan the QR if you haven't yet."
          : 'Open your banking app and scan the QR code above to complete payment.'
        }
      </p>
    </>
  )
}

function SuccessState() {
  return (
    <>
      <h3 className="mb-6" style={{ color: 'var(--emerald-700)' }}>
        Payment Complete!
      </h3>
      <div className="flex justify-center mb-6">
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: 'var(--emerald-100)',
            width: '280px',
            height: '280px',
          }}
        >
          <CheckCircle className="w-24 h-24" style={{ color: 'var(--emerald-500)' }} />
        </div>
      </div>
      <p style={{ color: 'var(--gray-700)', fontSize: '14px', lineHeight: '1.5' }}>
        Your payment has been processed successfully. Your order is now being prepared.
      </p>
    </>
  )
}

function FailedState({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <>
      <h3 className="mb-4" style={{ color: 'var(--red-700)' }}>
        Payment Failed
      </h3>
      <div className="flex justify-center mb-6">
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: 'var(--red-100)',
            width: '280px',
            height: '280px',
          }}
        >
          <XCircle className="w-24 h-24" style={{ color: 'var(--red-500)' }} />
        </div>
      </div>
      {error && (
        <p style={{ color: 'var(--red-600)', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </p>
      )}
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-2 rounded-full transition-all hover:shadow-sm active:scale-95"
        style={{ backgroundColor: 'var(--orange-500)', color: 'white', fontSize: '14px' }}
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </>
  )
}

function ExpiredState({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <h3 className="mb-4" style={{ color: 'var(--amber-700)' }}>
        Payment Expired
      </h3>
      <div className="flex justify-center mb-6">
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: 'var(--amber-100)',
            width: '280px',
            height: '280px',
          }}
        >
          <Clock className="w-24 h-24" style={{ color: 'var(--amber-500)' }} />
        </div>
      </div>
      <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginBottom: '16px' }}>
        The QR code has expired. Please generate a new one to complete payment.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-2 rounded-full transition-all hover:shadow-sm active:scale-95"
        style={{ backgroundColor: 'var(--orange-500)', color: 'white', fontSize: '14px' }}
      >
        <RefreshCw className="w-4 h-4" />
        Generate New QR
      </button>
    </>
  )
}

function PaymentInstructions() {
  return (
    <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
      <h4 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '15px', fontWeight: 600 }}>
        How to pay with VietQR
      </h4>
      <ol className="space-y-2" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
        <li className="flex gap-2">
          <span style={{ color: 'var(--orange-500)', fontWeight: 600 }}>1.</span>
          Open your banking app (Vietcombank, MB Bank, Techcombank, etc.)
        </li>
        <li className="flex gap-2">
          <span style={{ color: 'var(--orange-500)', fontWeight: 600 }}>2.</span>
          Select &quot;QR Transfer&quot; or &quot;Scan QR&quot;
        </li>
        <li className="flex gap-2">
          <span style={{ color: 'var(--orange-500)', fontWeight: 600 }}>3.</span>
          Scan the QR code above
        </li>
        <li className="flex gap-2">
          <span style={{ color: 'var(--orange-500)', fontWeight: 600 }}>4.</span>
          Confirm the transfer amount and complete payment
        </li>
      </ol>
    </div>
  )
}

function StickyActionBar({
  status,
  onViewOrder,
  onRetry,
  onBack,
}: {
  status: SepayPaymentStatus
  onViewOrder: () => void
  onRetry: () => void
  onBack: () => void
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-area-bottom"
      style={{ borderColor: 'var(--gray-200)' }}
    >
      <div className="max-w-md mx-auto space-y-2">
        {/* Success: View Order button */}
        {status === 'success' && (
          <button
            onClick={onViewOrder}
            className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--emerald-500)',
              color: 'white',
              minHeight: '48px',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            View Order Status
          </button>
        )}

        {/* Waiting/Processing: Show waiting message */}
        {(status === 'waiting' || status === 'processing') && (
          <button
            disabled
            className="w-full py-3 px-6 rounded-full opacity-60 cursor-not-allowed"
            style={{
              backgroundColor: 'var(--gray-300)',
              color: 'var(--gray-600)',
              minHeight: '48px',
              fontSize: '15px',
            }}
          >
            {status === 'waiting' ? 'Waiting for payment...' : 'Verifying payment...'}
          </button>
        )}

        {/* Failed/Expired: Retry + Back */}
        {(status === 'failed' || status === 'expired') && (
          <>
            <button
              onClick={onRetry}
              className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
              style={{
                backgroundColor: 'var(--orange-500)',
                color: 'white',
                minHeight: '48px',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 px-6 rounded-full border-2 transition-all hover:shadow-sm active:scale-95"
              style={{
                borderColor: 'var(--gray-300)',
                color: 'var(--gray-700)',
                minHeight: '48px',
                fontSize: '15px',
              }}
            >
              Back to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  )
}
