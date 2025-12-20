'use client'

import { ClipboardList, CheckCircle, Clock, LogIn } from 'lucide-react'
import { StatusBadge, LanguageSwitcher } from '@/components'
import { useLanguage } from '@/hooks/useLanguage'
import { useRouter } from 'next/navigation'

export function OrderListPage() {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  
  // TODO: Fetch from API
  const currentOrder = null as { id: string } | null
  const orderHistory: { id: string; date: string; total: number }[] = []
  const isLoggedIn = false

  const text = {
    EN: {
      title: 'Orders',
      currentSession: 'Current Session',
      noActiveOrder: 'No active order',
      noActiveOrderDesc: 'Place an order to see it here',
      orderHistory: 'Order History',
      signInPrompt: 'Sign in to view your past orders',
      signInButton: 'Sign in',
      noPastOrders: 'No past orders yet',
      viewTracking: 'View Tracking',
      items: 'items',
    },
    VI: {
      title: 'Đơn hàng',
      currentSession: 'Phiên hiện tại',
      noActiveOrder: 'Không có đơn hàng',
      noActiveOrderDesc: 'Đặt món để xem tại đây',
      orderHistory: 'Lịch sử đơn hàng',
      signInPrompt: 'Đăng nhập để xem đơn hàng cũ',
      signInButton: 'Đăng nhập',
      noPastOrders: 'Chưa có đơn hàng cũ',
      viewTracking: 'Xem theo dõi',
      items: 'món',
    },
  }

  const t = text[language]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center justify-between">
          <h2 style={{ color: 'var(--gray-900)' }}>{t.title}</h2>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Session */}
        <div>
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '16px' }}>{t.currentSession}</h3>
          {currentOrder ? (
            <div className="bg-white rounded-xl p-4 border cursor-pointer" onClick={() => router.push(`/orders/${currentOrder!.id}`)}>
              <p>Order #{currentOrder!.id}</p>
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
          {!isLoggedIn ? (
            <div className="bg-white rounded-xl p-8 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
              <LogIn className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gray-400)' }} />
              <p className="mb-4" style={{ color: 'var(--gray-900)' }}>{t.signInPrompt}</p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 rounded-full"
                style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
              >
                {t.signInButton}
              </button>
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
              <p style={{ color: 'var(--gray-600)' }}>{t.noPastOrders}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderHistory.map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-4 border cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                  <p>Order #{order.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

