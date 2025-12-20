'use client'

import { XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function EmailVerificationFailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--red-100)' }}>
          <XCircle className="w-10 h-10" style={{ color: 'var(--red-600)' }} />
        </div>
        <h1 className="text-2xl mb-2">Verification Failed</h1>
        <p className="mb-6">The verification link is invalid or expired</p>
        <button onClick={() => router.push('/login')} className="px-6 py-3 rounded-full text-white" style={{ backgroundColor: 'var(--orange-500)' }}>
          Back to Sign In
        </button>
      </div>
    </div>
  )
}
