import { Suspense } from 'react'
import { GoogleCallbackPage } from '@/features/auth/ui/pages/GoogleCallbackPage'
import { Loader2 } from 'lucide-react'

function CallbackFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--orange-500)' }} />
        <p style={{ color: 'var(--gray-600)' }}>Loading...</p>
      </div>
    </div>
  )
}

export default function GoogleCallback() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <GoogleCallbackPage />
    </Suspense>
  )
}
