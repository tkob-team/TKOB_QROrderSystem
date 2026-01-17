'use client'

import { useRouter } from 'next/navigation'
import { QrCode } from 'lucide-react'

interface AppHeaderProps {
  title?: string
  showBackButton?: boolean
  onBack?: () => void
}

/**
 * Shared app header with logo that navigates to /scan-qr
 * Used across customer app pages for consistent branding
 */
export function AppHeader({ title, showBackButton = false, onBack }: AppHeaderProps) {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push('/scan-qr')
  }

  return (
    <header 
      className="sticky top-0 z-10 bg-white border-b px-4 py-3"
      style={{ borderColor: 'var(--gray-200)' }}
    >
      <div className="flex items-center justify-center relative">
        {/* Back button (optional) */}
        {showBackButton && (
          <button
            onClick={onBack || (() => router.back())}
            className="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'var(--gray-900)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Logo/Brand - centered, clickable */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--orange-500)' }}
          >
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span 
            className="font-semibold"
            style={{ 
              color: 'var(--gray-900)',
              fontSize: '18px',
              fontFamily: "'Playfair Display SC', serif",
            }}
          >
            {title || 'QR Dine'}
          </span>
        </button>
      </div>
    </header>
  )
}
