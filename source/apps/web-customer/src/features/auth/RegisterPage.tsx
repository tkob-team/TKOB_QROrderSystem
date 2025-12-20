'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Call register API
    router.push('/verify-email')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl mb-6 text-center">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border" required />
          </div>
          <div>
            <label className="block mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border" required />
          </div>
          <div>
            <label className="block mb-2">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border" required />
          </div>
          <button type="submit" className="w-full py-3 rounded-full text-white" style={{ backgroundColor: 'var(--orange-500)' }}>Create Account</button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="text-orange-500">Sign In</button>
        </p>
      </div>
    </div>
  )
}
