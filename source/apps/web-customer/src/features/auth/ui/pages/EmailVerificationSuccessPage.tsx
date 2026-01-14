'use client'

import { CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { LanguageSwitcher } from '@/shared/components/common/LanguageSwitcher'
import type { Language } from '@/types'
import { useAuthController } from '../../hooks'
import { AUTH_TEXT } from '../../model'

export function EmailVerificationSuccessPage() {
  const [language, setLanguage] = useState<Language>('EN')
  const controller = useAuthController()
  const t = AUTH_TEXT[language]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center justify-end">
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
        <div className="max-w-md w-full text-center">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--emerald-100)' }}
          >
            <CheckCircle className="w-14 h-14" style={{ color: 'var(--emerald-600)' }} />
          </div>

          <h1 className="mb-4" style={{ color: 'var(--gray-900)', fontSize: '28px' }}>
            {t.verificationSuccessTitle}
          </h1>

          <p className="mb-6" style={{ color: 'var(--gray-700)', fontSize: '16px', lineHeight: '1.6' }}>
            {t.verificationSuccessDesc}
          </p>

          <div 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full mb-6"
            style={{ backgroundColor: 'var(--emerald-50)' }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
            <span style={{ color: 'var(--emerald-700)', fontSize: '14px' }}>
              ✓ {t.emailVerified}
            </span>
          </div>

          <p style={{ color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.5' }}>
            {t.verificationSuccessHelper}
          </p>
        </div>
      </div>

      <div 
        className="sticky bottom-0 bg-white border-t p-4 space-y-3"
        style={{ borderColor: 'var(--gray-200)' }}
      >
        <button
          onClick={controller.navigateToProfile}
          className="w-full py-3.5 px-4 rounded-full transition-all hover:shadow-md active:scale-98"
          style={{
            backgroundColor: 'var(--orange-500)',
            color: 'white',
            minHeight: '52px',
            fontSize: '16px',
          }}
        >
          {t.continueToProfile}
        </button>

        <button
          onClick={controller.navigateToMenu}
          className="w-full py-3 text-center transition-colors"
          style={{
            color: 'var(--gray-600)',
            fontSize: '15px',
          }}
        >
          {t.goToMenu}
        </button>
      </div>
    </div>
  )
}
