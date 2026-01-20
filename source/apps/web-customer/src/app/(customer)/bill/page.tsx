import { Suspense } from 'react'
import { BillPreviewPage } from '@/features/orders/ui/pages/BillPreviewPage'

/**
 * Bill Preview page route.
 * Shows consolidated bill for all orders in the current session.
 * Accessible after customer clicks "Request Bill" button.
 */
export default function BillPage() {
  return (
    <Suspense fallback={<BillFallback />}>
      <BillPreviewPage />
    </Suspense>
  )
}

/**
 * Loading fallback while page is being resolved.
 */
function BillFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--orange-500)' }}></div>
        <p style={{ color: 'var(--gray-600)' }}>Loading your bill...</p>
      </div>
    </div>
  )
}
