'use client'

import { useRouter } from 'next/navigation'
import { Smartphone } from 'lucide-react'
import { useEffect } from 'react'
import { LanguageSwitcher } from '@/shared/components'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { useSession } from '@/features/tables/hooks'
import { log } from '@/shared/logging/logger'
import { LANDING_TEXT } from '../../model/constants'

export function LandingPage() {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  const { session, loading, error } = useSession()

  // Redirect if no session (not scanned QR)
  useEffect(() => {
    if (!loading && !session) {
      log('nav', 'No session found, redirecting to invalid-qr', null, { feature: 'landing' })
      router.push('/invalid-qr?reason=no-session')
    }
  }, [loading, session, router])

  // Show loading while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p style={{ color: 'var(--gray-600)' }}>{LANDING_TEXT[language].loading}</p>
        </div>
      </div>
    )
  }

  // If no session, show nothing (will redirect)
  if (!session) {
    return null
  }

  const t = LANDING_TEXT[language]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
            <span className="text-white text-lg">🍽️</span>
          </div>
          <span style={{ color: '#111827' }}>{session?.restaurantName || 'The Golden Spoon'}</span>
        </div>
        <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          {/* Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ backgroundColor: '#FFEDD5' }}>
              <Smartphone className="w-12 h-12" style={{ color: '#F97316' }} />
            </div>
          </div>

          {/* Welcome Card */}
          <div className="bg-white rounded-xl p-6 text-center" style={{ borderWidth: '1px', borderColor: '#E5E7EB', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <p className="mb-1" style={{ color: '#6B7280', fontSize: '14px' }}>
              {t.welcome}
            </p>
            <h1 className="mb-6" style={{ color: '#111827', fontSize: '26px', lineHeight: '1.3' }}>
              {session?.restaurantName || 'The Golden Spoon'}
            </h1>
            
            {/* Table Info Card */}
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#FFF7ED', borderWidth: '1px', borderColor: '#FFEDD5' }}>
              <p className="mb-1" style={{ color: '#111827', fontSize: '15px' }}>
                🪑 {t.tableInfo(session.tableNumber)}
              </p>
              <p className="mb-1" style={{ color: '#374151', fontSize: '14px' }}>
                👥 {t.guestCount}
              </p>
              <p style={{ color: '#6B7280', fontSize: '12px' }}>
                📅 {t.validText}
              </p>
            </div>

            {/* Primary CTA - Orange */}
            <button
              onClick={() => router.push('/menu')}
              className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-98"
              style={{
                backgroundColor: '#F97316',
                color: 'white',
                fontSize: '15px',
                minHeight: '48px',
              }}
            >
              {t.ctaButton}
            </button>
          </div>

          {/* Helper Text */}
          <p className="mt-6 text-center" style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.5' }}>
            {t.helperText}
          </p>
        </div>
      </div>
    </div>
  )
}
