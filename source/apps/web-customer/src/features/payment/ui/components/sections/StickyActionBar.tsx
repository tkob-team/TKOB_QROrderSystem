import type { PaymentStatus } from '../../../model'

interface StickyActionBarProps {
  paymentStatus: PaymentStatus
  onViewOrderStatus: () => void
  onRetry: () => void
}

export function StickyActionBar({ paymentStatus, onViewOrderStatus, onRetry }: StickyActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="max-w-[480px] mx-auto">
        {paymentStatus === 'waiting' && (
          <button
            disabled
            className="w-full py-3 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--gray-400)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            Waiting for payment…
          </button>
        )}
        {paymentStatus === 'success' && (
          <button
            onClick={onViewOrderStatus}
            className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--emerald-600)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            View order status
          </button>
        )}
        {paymentStatus === 'failed' && (
          <button
            onClick={onRetry}
            className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
