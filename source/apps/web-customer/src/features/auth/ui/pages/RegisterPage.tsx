'use client'

import { useState } from 'react'
import { useAuthController } from '../../hooks'
import type { RegisterForm } from '../../model'
import { AppHeader } from '@/shared/components/layout/AppHeader'

export function RegisterPage() {
  const controller = useAuthController()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData: RegisterForm = { email, password, confirmPassword }
    controller.handleRegister(formData)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header with logo */}
      <AppHeader />
      
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl mb-6 text-center">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border" 
              required 
              disabled={controller.isRegisterLoading}
            />
          </div>
          <div>
            <label className="block mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border" 
              required 
              disabled={controller.isRegisterLoading}
            />
          </div>
          <div>
            <label className="block mb-2">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border" 
              required 
              disabled={controller.isRegisterLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={controller.isRegisterLoading}
            className="w-full py-3 rounded-full text-white disabled:opacity-60" 
            style={{ backgroundColor: 'var(--orange-500)' }}
          >
            {controller.isRegisterLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{' '}
          <button onClick={controller.navigateToLogin} className="text-orange-500">Sign In</button>
        </p>
      </div>
      </div>
    </div>
  )
}
