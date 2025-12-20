import { Mail, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';

export type Language = 'EN' | 'VI';

interface VerifyEmailRequiredModalProps {
  onClose: () => void;
  onVerifyNow: () => void;
  language?: Language;
}

export function VerifyEmailRequiredModal({ onClose, onVerifyNow, language = 'EN' }: VerifyEmailRequiredModalProps) {
  const text = {
    EN: {
      title: 'Verify your email to write a review',
      description: 'Reviews help other customers. Please verify your email to submit feedback.',
      verifyNow: 'Verify now',
      later: 'Later',
    },
    VI: {
      title: 'Xác thực email để viết đánh giá',
      description: 'Đánh giá giúp khách hàng khác. Vui lòng xác thực email để gửi phản hồi.',
      verifyNow: 'Xác thực ngay',
      later: 'Để sau',
    },
  };

  const t = text[language];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-2xl p-6 max-w-md w-full mx-4 mb-0 sm:mb-4"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
        >
          <X className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
        </button>

        {/* Icon */}
        <div className="text-center mb-4">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" 
            style={{ backgroundColor: 'var(--orange-100)' }}
          >
            <Mail className="w-8 h-8" style={{ color: 'var(--orange-600)' }} />
          </div>

          {/* Title */}
          <h3 className="mb-2" style={{ color: 'var(--gray-900)', fontSize: '20px' }}>
            {t.title}
          </h3>

          {/* Description */}
          <p style={{ color: 'var(--gray-600)', fontSize: '15px', lineHeight: '1.5' }}>
            {t.description}
          </p>
        </div>

        {/* Info Banner */}
        <div 
          className="rounded-xl p-3.5 mb-6"
          style={{ backgroundColor: 'var(--orange-50)', border: '1px solid var(--orange-200)' }}
        >
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--orange-600)' }} />
            <p style={{ color: 'var(--orange-800)', fontSize: '13px', lineHeight: '1.4' }}>
              {language === 'EN' 
                ? 'Verified reviews build trust and help maintain quality standards.'
                : 'Đánh giá đã xác thực xây dựng niềm tin và duy trì tiêu chuẩn chất lượng.'
              }
            </p>
          </div>
        </div>

        {/* Actions - Clear Primary/Secondary Hierarchy */}
        <div className="space-y-3">
          {/* Primary Action: Verify Now (Filled Orange Button) */}
          <button
            onClick={onVerifyNow}
            className="w-full py-3.5 px-4 rounded-full transition-all hover:shadow-lg active:scale-98"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
              fontSize: '16px',
            }}
          >
            {t.verifyNow}
          </button>

          {/* Secondary Action: Later (Outline Gray Button) */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-full transition-all hover:bg-[var(--gray-50)] active:scale-98"
            style={{
              border: '2px solid var(--gray-300)',
              backgroundColor: 'white',
              color: 'var(--gray-600)',
              minHeight: '44px',
              fontSize: '15px',
            }}
          >
            {t.later}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}