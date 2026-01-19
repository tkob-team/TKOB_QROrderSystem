'use client'

import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthController } from '../../hooks'
import { AUTH_TEXT } from '../../model'
import { LoginFormSection } from '../components/forms/LoginFormSection'
import { AppHeader } from '@/shared/components/layout/AppHeader'

export function LoginPage() {
  const controller = useAuthController()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header with logo */}
      <AppHeader />

      {/* Content */}
      <div className="flex-1 p-4 pb-8">
        {/* Title Section */}
        <div className="mb-6 text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--orange-100)' }}
          >
            <Mail className="w-8 h-8" style={{ color: 'var(--orange-500)' }} />
          </div>
          <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            {AUTH_TEXT.loginSubtitle}
          </p>
        </div>

        {/* Login Form */}
        <LoginFormSection
          onSubmit={controller.handleLogin}
          onForgotPassword={controller.navigateToResetPassword}
          isLoading={controller.isLoginLoading}
          textLabels={{
            emailLabel: AUTH_TEXT.emailLabel,
            emailPlaceholder: AUTH_TEXT.emailPlaceholder,
            passwordLabel: AUTH_TEXT.passwordLabel,
            passwordPlaceholder: AUTH_TEXT.passwordPlaceholder,
            forgotPassword: AUTH_TEXT.forgotPassword,
            signInButton: AUTH_TEXT.signInButton,
          }}
        />

        {/* Continue as Guest */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={controller.navigateBack}
            className="group inline-flex items-center gap-2 px-4 py-2 transition-colors hover:text-[var(--gray-700)]"
            style={{ color: 'var(--gray-600)', fontSize: '14px' }}
          >
            <span>{AUTH_TEXT.continueGuest}</span>
            <ArrowRight 
              className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1 group-active:translate-x-1" 
              style={{ color: 'var(--gray-600)' }}
            />
          </button>
          <p style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '4px' }}>
            {AUTH_TEXT.limitedFeatures}
          </p>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            {AUTH_TEXT.noAccount}{' '}
          </span>
          <button
            onClick={controller.navigateToRegister}
            className="transition-colors"
            style={{ color: 'var(--orange-500)', fontSize: '14px' }}
          >
            {AUTH_TEXT.signUp}
          </button>
        </div>
      </div>
    </div>
  )
}
