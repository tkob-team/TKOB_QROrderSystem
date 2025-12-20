'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Call reset password API
    alert('Reset link sent to your email')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl mb-6 text-center">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border" required />
          </div>
          <button type="submit" className="w-full py-3 rounded-full text-white" style={{ backgroundColor: 'var(--orange-500)' }}>
            Send Reset Link
          </button>
        </form>
        <p className="text-center mt-4">
          <button onClick={() => router.push('/login')} className="text-orange-500">Back to Sign In</button>
        </p>
      </div>
    </div>
  )
}
