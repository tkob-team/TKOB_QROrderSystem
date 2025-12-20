'use client'

import { XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function InvalidQRPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--red-100)' }}>
          <XCircle className="w-10 h-10" style={{ color: 'var(--red-600)' }} />
        </div>
        <h1 className="text-2xl mb-2" style={{ color: 'var(--gray-900)' }}>Invalid QR Code</h1>
        <p className="mb-6" style={{ color: 'var(--gray-600)' }}>
          This QR code is invalid or expired. Please scan a valid QR code from your table.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 rounded-full text-white"
          style={{ backgroundColor: 'var(--orange-500)' }}
        >
          Go Back
        </button>
      </div>
    </div>
  )
}
