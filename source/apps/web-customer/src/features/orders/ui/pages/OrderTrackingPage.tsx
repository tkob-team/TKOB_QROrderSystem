'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { ORDERS_TEXT } from '../../model'

interface OrderTrackingPageProps {
  orderId?: string
}

export function OrderTrackingPage({ orderId }: OrderTrackingPageProps) {
  const { language } = useLanguage()
  const t = ORDERS_TEXT[language]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="p-4 text-center">
        <h2 className="mb-4" style={{ color: 'var(--gray-900)' }}>{t.trackingOrder}</h2>
        <p style={{ color: 'var(--gray-600)' }}>Tracking order {orderId}...</p>
      </div>
    </div>
  )
}
