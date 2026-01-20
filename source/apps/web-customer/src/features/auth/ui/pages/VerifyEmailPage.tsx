'use client'

import { useState } from 'react'
import { useAuthController } from '../../hooks'
import { AppHeader } from '@/shared/components/layout/AppHeader'

export function VerifyEmailPage() {
  const controller = useAuthController()
  const [otp, setOtp] = useState('')
  const email = controller.getPendingEmail()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 4) {
      return
    }
    controller.handleConfirmOTP(otp)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      <AppHeader />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
            <p className="text-gray-600">
              We&apos;ve sent a verification code to{' '}
              {email ? <strong>{email}</strong> : 'your email address'}.
              <br />
              Please enter the code below to verify your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Verification Code (OTP)</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 rounded-xl border text-center text-2xl tracking-widest"
                maxLength={6}
                autoFocus
                disabled={controller.isConfirmOTPLoading}
              />
            </div>

            <button
              type="submit"
              disabled={otp.length < 4 || controller.isConfirmOTPLoading}
              className="w-full py-3 rounded-full text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--orange-500)' }}
            >
              {controller.isConfirmOTPLoading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Didn&apos;t receive the code?{' '}
            <button 
              onClick={() => controller.navigateToRegister()}
              className="text-orange-500 hover:underline"
            >
              Register again
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
