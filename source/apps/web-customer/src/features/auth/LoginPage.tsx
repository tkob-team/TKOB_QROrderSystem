'use client'

import { ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from '@/components/common';
import { Language } from '@/types/common';

export function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('EN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const text = {
    EN: {
      title: 'Sign in',
      subtitle: 'Welcome back! Sign in to access your order history.',
      emailLabel: 'Email address',
      emailPlaceholder: 'your@email.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      forgotPassword: 'Forgot password?',
      signInButton: 'Sign in',
      orContinueWith: 'or continue with',
      continueWithGoogle: 'Continue with Google',
      continueGuest: 'Continue as guest',
      limitedFeatures: 'Limited features',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
    },
    VI: {
      title: 'Đăng nhập',
      subtitle: 'Chào mừng trở lại! Đăng nhập để xem lịch sử đơn hàng.',
      emailLabel: 'Địa chỉ email',
      emailPlaceholder: 'email@example.com',
      passwordLabel: 'Mật khẩu',
      passwordPlaceholder: 'Nhập mật khẩu',
      forgotPassword: 'Quên mật khẩu?',
      signInButton: 'Đăng nhập',
      orContinueWith: 'hoặc tiếp tục với',
      continueWithGoogle: 'Tiếp tục với Google',
      continueGuest: 'Tiếp tục với tư cách khách',
      limitedFeatures: 'Tính năng hạn chế',
      noAccount: 'Chưa có tài khoản?',
      signUp: 'Đăng ký',
    },
  };

  const t = text[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // TODO: Call API login
      // For now, just navigate to menu
      router.push('/menu');
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    // TODO: Implement Google OAuth
    setTimeout(() => {
      router.push('/menu');
    }, 1000);
  };

  const handleBack = () => {
    router.back();
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
            </button>
            <h2 style={{ color: 'var(--gray-900)' }}>{t.title}</h2>
          </div>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </div>

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
            {t.subtitle}
          </p>
        </div>

        {/* Login Form */}
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
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
              onClick={handleForgotPassword}
              className="text-sm transition-colors"
              style={{ color: 'var(--orange-500)' }}
            >
              {t.forgotPassword}
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            {t.signInButton}
          </button>
        </form>

        {/* Divider with "or continue with" */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--gray-300)' }} />
          <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
            {t.orContinueWith}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--gray-300)' }} />
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full py-3 px-4 rounded-xl border transition-all hover:shadow-sm active:scale-98 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            borderColor: 'var(--gray-300)',
            backgroundColor: 'white',
            color: 'var(--gray-700)',
            minHeight: '52px',
          }}
        >
          {!isGoogleLoading && (
            <>
              {/* Google Icon SVG */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.8055 10.2292C19.8055 9.55056 19.7501 8.86667 19.6306 8.19873H10.2V12.0492H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.0879V17.5866H16.8251C18.7174 15.8449 19.8055 13.2728 19.8055 10.2292Z" fill="#4285F4"/>
                <path d="M10.2 20.0006C12.897 20.0006 15.1714 19.1151 16.8296 17.5865L13.607 15.0879C12.7096 15.6979 11.5521 16.0433 10.2045 16.0433C7.5975 16.0433 5.38671 14.2834 4.59132 11.917H1.26367V14.4927C2.96137 17.8695 6.41895 20.0006 10.2 20.0006Z" fill="#34A853"/>
                <path d="M4.58672 11.917C4.16916 10.675 4.16916 9.33008 4.58672 8.08805V5.51233H1.26366C-0.154858 8.33798 -0.154858 11.667 1.26366 14.4927L4.58672 11.917Z" fill="#FBBC04"/>
                <path d="M10.2 3.95805C11.6253 3.936 13.0033 4.47247 14.036 5.45722L16.8932 2.60218C15.0827 0.904587 12.6787 -0.0287217 10.2 0.000552588C6.41895 0.000552588 2.96137 2.13168 1.26367 5.51234L4.58673 8.08806C5.37752 5.71672 7.59291 3.95805 10.2 3.95805Z" fill="#EA4335"/>
              </svg>
              <span>{t.continueWithGoogle}</span>
            </>
          )}
          {isGoogleLoading && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gray-700)' }} />
              <span>Signing in...</span>
            </>
          )}
        </button>

        {/* Continue as Guest - De-emphasized with inline arrow */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleBack}
            className="group inline-flex items-center gap-2 px-4 py-2 transition-colors hover:text-[var(--gray-700)]"
            style={{ color: 'var(--gray-600)', fontSize: '14px' }}
          >
            <span>{t.continueGuest}</span>
            <ArrowRight 
              className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1 group-active:translate-x-1" 
              style={{ color: 'var(--gray-600)' }}
            />
          </button>
          <p style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '4px' }}>
            {t.limitedFeatures}
          </p>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            {t.noAccount}{' '}
          </span>
          <button
            onClick={handleRegister}
            className="transition-colors"
            style={{ color: 'var(--orange-500)', fontSize: '14px' }}
          >
            {t.signUp}
          </button>
        </div>
      </div>
    </div>
  );
}
