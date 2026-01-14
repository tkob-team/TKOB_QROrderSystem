import { Suspense } from 'react'
import { PaymentPageContent } from '@/features/payment/ui/pages/PaymentPageContent'

/**
 * Payment page route.
 * Wraps PaymentPageContent in Suspense to satisfy Next.js requirement
 * for useSearchParams() usage.
 */
export default function Payment() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentPageContent />
    </Suspense>
  )
}

/**
 * Loading fallback while search params are being resolved.
 */
function PaymentFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--orange-500)' }}></div>
        <p style={{ color: 'var(--gray-600)' }}>Loading payment page...</p>
      </div>
    </div>
  )
}
