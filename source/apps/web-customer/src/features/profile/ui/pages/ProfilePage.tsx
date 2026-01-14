'use client'

import { User, Phone, Mail, LogIn, LogOut, History, Edit, Lock } from 'lucide-react'
import { LanguageSwitcher } from '@/shared/components'
import { Language } from '@/types'
import { useState } from 'react'
import { useProfileController } from '../../hooks'
import { PROFILE_TEXT } from '../../model'

export function ProfilePage() {
  const [language, setLanguage] = useState<Language>('EN')
  const controller = useProfileController()
  const t = PROFILE_TEXT[language]

  if (controller.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-2 text-gray-600">{t.loadingProfile}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center justify-between">
          <h2 style={{ color: 'var(--gray-900)' }}>{t.title}</h2>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-24">
        {!controller.isLoggedIn ? (
          <>
            {/* Login Section */}
            <div className="bg-white rounded-xl border p-6 mb-4" style={{ borderColor: 'var(--gray-200)' }}>
              <div className="flex flex-col items-center text-center mb-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--orange-100)' }}
                >
                  <User className="w-8 h-8" style={{ color: 'var(--orange-500)' }} />
                </div>
                <h3 className="mb-2" style={{ color: 'var(--gray-900)' }}>{t.loginTitle}</h3>
                <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                  {t.loginDesc}
                </p>
              </div>
              
              <button
                onClick={controller.handleLogin}
                className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  minHeight: '48px',
                }}
              >
                <LogIn className="w-5 h-5" />
                <span>{t.loginButton}</span>
              </button>
            </div>

            {/* Guest Info */}
            <div className="bg-white rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--gray-200)' }}>
              <h4 className="mb-2" style={{ color: 'var(--gray-900)' }}>{t.guestTitle}</h4>
              <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                {t.guestDesc}
              </p>
            </div>
          </>
        ) : (
          /* Logged in user profile */
          <>
            {/* User Info Card */}
            <div className="bg-white rounded-xl border p-6 mb-4 text-center" style={{ borderColor: 'var(--gray-200)' }}>
              <div className="w-20 h-20 mx-auto mb-4">
                {controller.user?.avatar ? (
                  <img
                    src={controller.user.avatar}
                    alt={controller.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--orange-500)' }}
                  >
                    <User className="w-10 h-10" style={{ color: 'white' }} />
                  </div>
                )}
              </div>
              
              <h3 className="mb-1" style={{ color: 'var(--gray-900)' }}>{controller.user?.name || 'User'}</h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                {controller.user?.email || 'user@example.com'}
              </p>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl border overflow-hidden mb-4" style={{ borderColor: 'var(--gray-200)' }}>
              <h3 className="p-4 border-b" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}>
                {t.account}
              </h3>
              
              <button 
                onClick={controller.handleEditProfile}
                className="w-full p-4 border-b flex items-center gap-3 transition-colors hover:bg-[var(--gray-50)] active:bg-[var(--gray-100)]" 
                style={{ borderColor: 'var(--gray-200)' }}
              >
                <Edit className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
                <span style={{ color: 'var(--gray-900)' }}>{t.editProfile}</span>
              </button>
              
              <button 
                onClick={controller.handleChangePassword}
                className="w-full p-4 border-b flex items-center gap-3 transition-colors hover:bg-[var(--gray-50)] active:bg-[var(--gray-100)]" 
                style={{ borderColor: 'var(--gray-200)' }}
              >
                <Lock className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
                <span style={{ color: 'var(--gray-900)' }}>{t.changePassword}</span>
              </button>
              
              <button 
                onClick={controller.handleViewHistory}
                className="w-full p-4 border-b flex items-center gap-3 transition-colors hover:bg-[var(--gray-50)] active:bg-[var(--gray-100)]" 
                style={{ borderColor: 'var(--gray-200)' }}
              >
                <History className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
                <span style={{ color: 'var(--gray-900)' }}>{t.orderHistory}</span>
              </button>
              
              <button 
                onClick={controller.handleLogout}
                className="w-full p-4 flex items-center gap-3 transition-colors hover:bg-[var(--gray-50)] active:bg-[var(--gray-100)]"
              >
                <LogOut className="w-5 h-5" style={{ color: 'var(--red-600)' }} />
                <span style={{ color: 'var(--red-600)' }}>{t.signOut}</span>
              </button>
            </div>
          </>
        )}

        {/* Settings Section */}
        <div className="bg-white rounded-xl border overflow-hidden mb-4" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--gray-900)' }}>{t.language}</span>
              <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: 'var(--gray-200)' }}>
          <h3 className="p-4 border-b" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}>
            {t.support}
          </h3>
          
          <button className="w-full p-4 border-b flex items-center gap-3 transition-colors hover:bg-[var(--gray-50)] active:bg-[var(--gray-100)]" style={{ borderColor: 'var(--gray-200)' }}>
            <Phone className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
            <span style={{ color: 'var(--gray-900)' }}>{t.contactUs}</span>
          </button>
          
          <button className="w-full p-4 flex items-center gap-3 transition-colors hover:bg-[var(--gray-50)] active:bg-[var(--gray-100)]">
            <Mail className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
            <span style={{ color: 'var(--gray-900)' }}>{t.about}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
