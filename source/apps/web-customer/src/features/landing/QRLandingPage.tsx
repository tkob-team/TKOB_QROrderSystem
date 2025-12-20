'use client'

import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import type { Language } from '@/types';
import { mockRestaurant, mockTable } from '@/lib/mockData';

interface QRLandingProps {
  onViewMenu: () => void;
}

export function QRLandingPage({ onViewMenu }: QRLandingProps) {
  const [language, setLanguage] = useState<Language>('EN');

  const text = {
    EN: {
      welcome: 'Welcome to',
      tableInfo: `You're at Table ${mockTable.number}`,
      guestCount: `${mockTable.guestCount} guests`,
      validText: 'Scan valid for today only',
      ctaButton: 'View Menu',
      helperText: 'Browse our menu and place your order directly from your table',
    },
    VI: {
      welcome: 'Chào mừng đến',
      tableInfo: `Bạn đang ở bàn số ${mockTable.number}`,
      guestCount: `${mockTable.guestCount} khách`,
      validText: 'Mã QR có hiệu lực trong ngày hôm nay',
      ctaButton: 'Xem thực đơn',
      helperText: 'Duyệt thực đơn và đặt món ngay tại bàn của bạn',
    },
  };

  const t = text[language];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
            <span className="text-white text-lg">🍽️</span>
          </div>
          <span style={{ color: '#111827' }}>{mockRestaurant.name}</span>
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
              {mockRestaurant.name}
            </h1>
            
            {/* Table Info Card */}
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#FFF7ED', borderWidth: '1px', borderColor: '#FFEDD5' }}>
              <p className="mb-1" style={{ color: '#111827', fontSize: '15px' }}>
                🪑 {t.tableInfo}
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
              onClick={onViewMenu}
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
  );
}