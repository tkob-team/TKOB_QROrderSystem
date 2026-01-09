'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { ORDERS_TEXT } from '../../model'

interface OrderConfirmationPageProps {
  orderId?: string
}

export function OrderConfirmationPage({ orderId }: OrderConfirmationPageProps) {
  const { language } = useLanguage()
  const t = ORDERS_TEXT[language]

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="text-center">
        <h2 className="mb-4" style={{ color: 'var(--gray-900)' }}>{t.orderConfirmed}</h2>
        <p style={{ color: 'var(--gray-600)' }}>Your order has been confirmed.</p>
        {orderId && <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Order ID: {orderId}</p>}
      </div>
    </div>
  )
}
