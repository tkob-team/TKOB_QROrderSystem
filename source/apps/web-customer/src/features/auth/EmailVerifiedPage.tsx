'use client'

import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function EmailVerifiedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--emerald-100)' }}>
          <CheckCircle className="w-10 h-10" style={{ color: 'var(--emerald-600)' }} />
        </div>
        <h1 className="text-2xl mb-2">Email Verified!</h1>
        <p className="mb-6">Your email has been verified successfully</p>
        <button onClick={() => router.push('/login')} className="px-6 py-3 rounded-full text-white" style={{ backgroundColor: 'var(--orange-500)' }}>
          Continue to Sign In
        </button>
      </div>
    </div>
  )
}
