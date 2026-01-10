'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { ORDERS_TEXT } from '../../model'

interface OrderDetailPageProps {
  orderId: string
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const router = useRouter()
  const { language } = useLanguage()

  const t = ORDERS_TEXT[language]

  // TODO: Integrate with useOrdersDetailController for order data fetching
  // For now, thin wrapper that accepts orderId prop

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <h2 style={{ color: 'var(--gray-900)' }}>{t.orderDetails}</h2>
        </div>
      </div>

      <div className="p-4">
        {/* Loading state placeholder */}
        <div className="text-center">
          <p style={{ color: 'var(--gray-600)' }}>Loading order {orderId}...</p>
        </div>
      </div>
    </div>
  )
}
