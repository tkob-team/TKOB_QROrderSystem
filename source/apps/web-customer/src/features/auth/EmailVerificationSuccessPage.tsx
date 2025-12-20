'use client'

import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import type { Language } from '@/types';

interface EmailVerificationSuccessProps {
  onContinueToProfile: () => void;
  onGoToMenu: () => void;
}

export function EmailVerificationSuccessPage({ onContinueToProfile, onGoToMenu }: EmailVerificationSuccessProps) {
  const [language, setLanguage] = useState<Language>('EN');

  const text = {
    EN: {
      title: 'Email verified successfully',
      description: 'Your email has been verified. You now have full access to all features.',
      helperText: 'You can safely close this page or continue to the app.',
      continueButton: 'Continue to profile',
      menuButton: 'Go to menu',
    },
    VI: {
      title: 'Xác thực email thành công',
      description: 'Email của bạn đã được xác thực. Bạn hiện có quyền truy cập đầy đủ vào tất cả tính năng.',
      helperText: 'Bạn có thể đóng trang này hoặc tiếp tục vào ứng dụng.',
      continueButton: 'Tiếp tục đến hồ sơ',
      menuButton: 'Đến menu',
    },
  };

  const t = text[language];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center justify-end">
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
        <div className="max-w-md w-full text-center">
          {/* Success Icon */}
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--emerald-100)' }}
          >
            <CheckCircle className="w-14 h-14" style={{ color: 'var(--emerald-600)' }} />
          </div>

          {/* Title */}
          <h1 className="mb-4" style={{ color: 'var(--gray-900)', fontSize: '28px' }}>
            {t.title}
          </h1>

          {/* Description */}
          <p className="mb-6" style={{ color: 'var(--gray-700)', fontSize: '16px', lineHeight: '1.6' }}>
            {t.description}
          </p>

          {/* Success Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full mb-6"
            style={{ backgroundColor: 'var(--emerald-50)' }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
            <span style={{ color: 'var(--emerald-700)', fontSize: '14px' }}>
              ✓ {language === 'EN' ? 'Email verified' : 'Email đã xác thực'}
            </span>
          </div>

          {/* Helper Text */}
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.5' }}>
            {t.helperText}
          </p>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div 
        className="sticky bottom-0 bg-white border-t p-4 space-y-3"
        style={{ borderColor: 'var(--gray-200)' }}
      >
        {/* Primary Action */}
        <button
          onClick={onContinueToProfile}
          className="w-full py-3.5 px-4 rounded-full transition-all hover:shadow-md active:scale-98"
          style={{
            backgroundColor: 'var(--orange-500)',
            color: 'white',
            minHeight: '52px',
            fontSize: '16px',
          }}
        >
          {t.continueButton}
        </button>

        {/* Secondary Action */}
        <button
          onClick={onGoToMenu}
          className="w-full py-3 text-center transition-colors"
          style={{
            color: 'var(--gray-600)',
            fontSize: '15px',
          }}
        >
          {t.menuButton}
        </button>
      </div>
    </div>
  );
}
