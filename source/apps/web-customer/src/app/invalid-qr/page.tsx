import { Suspense } from 'react'
import { InvalidQRPage } from '@/features/error'
import { Loader2 } from 'lucide-react'

function InvalidQRFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--orange-500)' }} />
    </div>
  )
}

export default function InvalidQR() {
  return (
    <Suspense fallback={<InvalidQRFallback />}>
      <InvalidQRPage />
    </Suspense>
  )
}
