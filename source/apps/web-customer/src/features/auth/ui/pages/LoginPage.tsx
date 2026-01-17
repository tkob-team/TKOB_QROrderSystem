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

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--gray-300)' }} />
          <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
            {AUTH_TEXT.orContinueWith}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--gray-300)' }} />
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={controller.handleGoogleSignIn}
          disabled={controller.isGoogleLoading}
          className="w-full py-3 px-4 rounded-xl border transition-all hover:shadow-sm active:scale-98 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            borderColor: 'var(--gray-300)',
            backgroundColor: 'white',
            color: 'var(--gray-700)',
            minHeight: '52px',
          }}
        >
          {!controller.isGoogleLoading && (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.8055 10.2292C19.8055 9.55056 19.7501 8.86667 19.6306 8.19873H10.2V12.0492H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.0879V17.5866H16.8251C18.7174 15.8449 19.8055 13.2728 19.8055 10.2292Z" fill="#4285F4"/>
                <path d="M10.2 20.0006C12.897 20.0006 15.1714 19.1151 16.8296 17.5865L13.607 15.0879C12.7096 15.6979 11.5521 16.0433 10.2045 16.0433C7.5975 16.0433 5.38671 14.2834 4.59132 11.917H1.26367V14.4927C2.96137 17.8695 6.41895 20.0006 10.2 20.0006Z" fill="#34A853"/>
                <path d="M4.58672 11.917C4.16916 10.675 4.16916 9.33008 4.58672 8.08805V5.51233H1.26366C-0.154858 8.33798 -0.154858 11.667 1.26366 14.4927L4.58672 11.917Z" fill="#FBBC04"/>
                <path d="M10.2 3.95805C11.6253 3.936 13.0033 4.47247 14.036 5.45722L16.8932 2.60218C15.0827 0.904587 12.6787 -0.0287217 10.2 0.000552588C6.41895 0.000552588 2.96137 2.13168 1.26367 5.51234L4.58673 8.08806C5.37752 5.71672 7.59291 3.95805 10.2 3.95805Z" fill="#EA4335"/>
              </svg>
              <span>{AUTH_TEXT.continueWithGoogle}</span>
            </>
          )}
          {controller.isGoogleLoading && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gray-700)' }} />
              <span>{AUTH_TEXT.signIn}</span>
            </>
          )}
        </button>

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
