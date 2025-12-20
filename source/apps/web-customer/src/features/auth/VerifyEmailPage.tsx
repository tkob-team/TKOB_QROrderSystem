'use client'

import { Mail } from 'lucide-react'

export function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--blue-100)' }}>
          <Mail className="w-10 h-10" style={{ color: 'var(--blue-600)' }} />
        </div>
        <h1 className="text-2xl mb-2">Verify Your Email</h1>
        <p className="mb-6" style={{ color: 'var(--gray-600)' }}>We&apos;ve sent a verification link to your email</p>
      </div>
    </div>
  )
}
