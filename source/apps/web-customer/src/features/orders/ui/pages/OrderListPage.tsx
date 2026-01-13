'use client'

import { ArrowRight, ClipboardList, LogIn, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/shared/hooks/useLanguage'
import { log } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { useOrdersController } from '../../hooks'
import { ORDERS_TEXT } from '../../model'

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const secs = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (secs < 60) return 'just now'
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
    return date.toLocaleDateString()
  } catch {
    return dateStr
  }
}

export function OrderListPage() {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  const { state, openOrderDetails, handleLogin } = useOrdersController()

  const t = ORDERS_TEXT[language]

  const handlePayNow = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent order detail navigation
    if (process.env.NEXT_PUBLIC_USE_LOGGING) {
      log('ui', 'Navigate to payment for order', { orderId: maskId(orderId) }, { feature: 'orders' })
    }
    router.push(`/payment?orderId=${orderId}&source=order`)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center justify-between">
          <h2 style={{ color: 'var(--gray-900)' }}>{t.title}</h2>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Session Orders */}
        <div>
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '16px' }}>
            {t.currentSession}
          </h3>
          {state.currentSessionOrders.length > 0 ? (
            <div className="space-y-2">
              {state.currentSessionOrders.map((order) => {
                const isUnpaid = order.paymentStatus === 'Unpaid' || order.paymentStatus === 'Failed'
                
                return (
                  <div
                    key={order.id}
                    onClick={() => openOrderDetails(order.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openOrderDetails(order.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="w-full bg-white rounded-xl p-4 border text-left transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                    style={{ borderColor: 'var(--gray-200)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p style={{ color: 'var(--gray-900)', fontWeight: '500' }}>
                          Order #{order.id}
                        </p>
                        {/* Payment Status Badge */}
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: isUnpaid ? 'var(--orange-100)' : 'var(--emerald-100)',
                            color: isUnpaid ? 'var(--orange-700)' : 'var(--emerald-700)',
                          }}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                    </div>
                    <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginBottom: '8px' }}>
                      {formatRelativeTime(order.createdAt)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                      <span style={{ color: 'var(--orange-500)', fontWeight: '500' }}>
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Inline Pay CTA for Unpaid Orders */}
                    {isUnpaid && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--gray-200)' }}>
                        <button
                          onClick={(e) => handlePayNow(order.id, e)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all hover:shadow-sm active:scale-95"
                          style={{
                            backgroundColor: 'var(--orange-500)',
                            color: 'white',
                            fontSize: '14px',
                          }}
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay ${order.total.toFixed(2)}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
              <ClipboardList className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gray-400)' }} />
              <p style={{ color: 'var(--gray-900)' }}>{t.noActiveOrder}</p>
              <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.noActiveOrderDesc}</p>
            </div>
          )}
        </div>

        {/* Order History */}
        <div>
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '16px' }}>{t.orderHistory}</h3>
          {!state.isLoggedIn ? (
            <div className="bg-white rounded-xl p-8 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
              <LogIn className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gray-400)' }} />
              <p className="mb-4" style={{ color: 'var(--gray-900)' }}>{t.signInPrompt}</p>
              <button
                onClick={handleLogin}
                className="px-6 py-2 rounded-full"
                style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
              >
                {t.signInButton}
              </button>
            </div>
          ) : state.orderHistory.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
              <p style={{ color: 'var(--gray-600)' }}>{t.noPastOrders}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.orderHistory.map((order) => {
                const isPaid = order.paymentStatus === 'Paid'
                
                return (
                  <div
                    key={order.id}
                    onClick={() => openOrderDetails(order.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openOrderDetails(order.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="w-full bg-white rounded-xl p-4 border text-left transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                    style={{ borderColor: 'var(--gray-200)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p style={{ color: 'var(--gray-900)' }}>Order #{order.id}</p>
                      {/* Payment Status Badge */}
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: isPaid ? 'var(--emerald-100)' : 'var(--orange-100)',
                          color: isPaid ? 'var(--emerald-700)' : 'var(--orange-700)',
                        }}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                      <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
