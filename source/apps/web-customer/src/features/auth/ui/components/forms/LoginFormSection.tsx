'use client'

import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { LoginForm } from '../../../model'

interface LoginFormSectionProps {
  onSubmit: (data: LoginForm) => void
  onForgotPassword: () => void
  isLoading: boolean
  textLabels: {
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    forgotPassword: string
    signInButton: string
  }
}

export function LoginFormSection({
  onSubmit,
  onForgotPassword,
  isLoading,
  textLabels: t,
}: LoginFormSectionProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      onSubmit({ email, password })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Input */}
      <div>
        <label 
          htmlFor="email" 
          className="block mb-2"
          style={{ color: 'var(--gray-900)', fontSize: '14px' }}
        >
          {t.emailLabel}
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Mail className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full pl-12 pr-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--orange-500)] focus:border-transparent"
            style={{
              borderColor: 'var(--gray-300)',
              backgroundColor: 'white',
              color: 'var(--gray-900)',
              minHeight: '48px',
            }}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label 
          htmlFor="password" 
          className="block mb-2"
          style={{ color: 'var(--gray-900)', fontSize: '14px' }}
        >
          {t.passwordLabel}
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Lock className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            className="w-full pl-12 pr-12 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--orange-500)] focus:border-transparent"
            style={{
              borderColor: 'var(--gray-300)',
              backgroundColor: 'white',
              color: 'var(--gray-900)',
              minHeight: '48px',
            }}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
            ) : (
              <Eye className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm transition-colors"
          style={{ color: 'var(--orange-500)' }}
          disabled={isLoading}
        >
          {t.forgotPassword}
        </button>
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--orange-500)',
          color: 'white',
          minHeight: '48px',
        }}
      >
        {t.signInButton}
      </button>
    </form>
  )
}
