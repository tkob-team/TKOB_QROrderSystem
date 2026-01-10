'use client'

import { useState } from 'react'
import { useAuthController } from '../../hooks'
import type { ResetPasswordForm } from '../../model'

interface ResetPasswordTokenPageProps {
  token: string
}

export function ResetPasswordTokenPage({ token }: ResetPasswordTokenPageProps) {
  const controller = useAuthController()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData: ResetPasswordForm = { password, confirmPassword }
    controller.handleResetPassword(token, formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl mb-6 text-center">Set New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">New Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border" 
              required 
              disabled={controller.isResetPasswordLoading}
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
              disabled={controller.isResetPasswordLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={controller.isResetPasswordLoading}
            className="w-full py-3 rounded-full text-white disabled:opacity-60" 
            style={{ backgroundColor: 'var(--orange-500)' }}
          >
            {controller.isResetPasswordLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
