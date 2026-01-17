'use client'

import { XCircle, QrCode } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@/shared/components/layout/AppHeader'

export function InvalidQRPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  // Get appropriate message based on reason
  const getMessage = () => {
    switch (reason) {
      case 'no-session':
        return 'You need to scan a table QR code to start ordering. Please scan the QR code on your table.'
      case 'expired':
        return 'This QR session has expired. Please scan the QR code again to continue.'
      case 'invalid-token':
        return 'This QR code is invalid. Please scan a valid QR code from your table.'
      default:
        return 'This QR code is invalid or expired. Please scan a valid QR code from your table.'
    }
  }

  const handleScanQR = () => {
    router.push('/scan-qr')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      <AppHeader />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--red-100)' }}>
            <XCircle className="w-10 h-10" style={{ color: 'var(--red-600)' }} />
          </div>
          <h1 className="text-2xl mb-2" style={{ color: 'var(--gray-900)', fontWeight: 600 }}>
            Invalid QR Code
          </h1>
          <p className="mb-8" style={{ color: 'var(--gray-600)', fontSize: '15px', lineHeight: '1.6' }}>
            {getMessage()}
          </p>
          
          <button
            onClick={handleScanQR}
            className="w-full py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all hover:shadow-md active:scale-98"
            style={{ 
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              minHeight: '56px',
            }}
          >
            <QrCode className="w-6 h-6" />
            <span>Scan QR Code</span>
          </button>
          
          <p className="mt-6" style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
            Need help? Ask a staff member for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}
