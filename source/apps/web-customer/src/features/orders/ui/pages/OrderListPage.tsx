'use client'

import { useMemo, useState } from 'react'
import { ClipboardList, LogIn, Receipt, Package, UtensilsCrossed, Loader2, XCircle, Lock, Plus, Wifi, WifiOff, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/shared/components/transitions/PageTransition'
import { log } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { useOrdersController } from '../../hooks'
import { useRequestBill } from '../../hooks/useRequestBill'
import { useCancelBillRequest } from '../../hooks/useCancelBillRequest'
import { useOrderRealtimeUpdates } from '../../hooks/useOrderRealtimeUpdates'
import { useSession } from '@/features/tables/hooks'
import { ORDERS_TEXT } from '../../model'
import { InlineOrderTracking } from '../components/InlineOrderTracking'
import { ReviewServedItemsModal } from '../components/modals/ReviewServedItemsModal'

export function OrderListPage() {
  const router = useRouter()
  const { state, handleLogin } = useOrdersController()
  const { session } = useSession()
  const requestBillMutation = useRequestBill()
  const cancelBillMutation = useCancelBillRequest()
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isSubmittingReviews, setIsSubmittingReviews] = useState(false)
  
  // Connect WebSocket at page level for real-time updates on all orders
  const { isRealtimeConnected, connectionStatus } = useOrderRealtimeUpdates({
    tenantId: session?.tenantId || '',
    tableId: session?.tableId || '',
    enabled: !!session?.tenantId && !!session?.tableId && state.currentSessionOrders.length > 0,
    onStatusChange: (status, orderId) => {
      log('ui', 'Order status changed (Orders page)', {
        orderId: maskId(orderId),
        newStatus: status,
      }, { feature: 'orders' })
    },
  })
  
  // Derive billRequested from session data (server state)
  const billRequested = useMemo(() => {
    return session?.billRequestedAt != null
  }, [session?.billRequestedAt])

  // Calculate session summary
  const sessionSummary = useMemo(() => {
    const orders = state.currentSessionOrders
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0)
    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0)
    const orderCount = orders.length
    
    // NEW FLOW: Can request bill anytime, not just when SERVED
    // Bill requested state comes from session.billRequestedAt
    const canRequestBill = orders.length > 0 && !billRequested
    
    // Check if any orders are SERVED or COMPLETED (for Print Bill feature)
    const hasServedOrders = orders.some(order => {
      const status = order.status?.toString().toUpperCase()
      return status === 'SERVED' || status === 'COMPLETED'
    })
    
    return {
      totalAmount,
      totalItems,
      orderCount,
      canRequestBill,
      hasServedOrders,
    }
  }, [state.currentSessionOrders, billRequested])

  // Handle Request Bill - Show review modal first, then request bill
  const handleRequestBillClick = () => {
    if (state.currentSessionOrders.length === 0) return
    
    // Check if any orders have SERVED status (or READY/Completed for review eligibility)
    const hasServedOrders = state.currentSessionOrders.some(
      order => {
        const status = order.status?.toString().toUpperCase()
        return status === 'SERVED' || status === 'COMPLETED' || status === 'READY'
      }
    )
    
    if (hasServedOrders) {
      // Show review modal for served items
      setShowReviewModal(true)
    } else {
      // No served items, go directly to bill
      proceedToRequestBill()
    }
  }
  
  // Actually request the bill (called after review or skip)
  const proceedToRequestBill = async () => {
    try {
      if (process.env.NEXT_PUBLIC_USE_LOGGING) {
        log('ui', 'Navigating to bill preview', { 
          totalAmount: sessionSummary.totalAmount,
          orderCount: sessionSummary.orderCount,
        }, { feature: 'orders' })
      }
      
      // Just navigate to bill preview - no lock/notify until customer confirms payment
      router.push('/bill')
    } catch (error) {
      console.error('Failed to navigate to bill:', error)
    }
  }
  
  // Handle review submission
  const handleReviewSubmit = async (reviews: { itemId: string; rating: number; comment: string }[]) => {
    setIsSubmittingReviews(true)
    
    try {
      // TODO: Submit reviews to API
      if (process.env.NEXT_PUBLIC_USE_LOGGING) {
        log('ui', 'Submitting reviews', { 
          reviewCount: reviews.length,
        }, { feature: 'orders' })
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setShowReviewModal(false)
      
      // Proceed to request bill
      await proceedToRequestBill()
    } catch (error) {
      console.error('Failed to submit reviews:', error)
    } finally {
      setIsSubmittingReviews(false)
    }
  }
  
  // Handle skip reviews
  const handleSkipReviews = () => {
    setShowReviewModal(false)
    proceedToRequestBill()
  }

  // Handle Cancel Bill Request
  const handleCancelBillRequest = async () => {
    try {
      if (process.env.NEXT_PUBLIC_USE_LOGGING) {
        log('ui', 'Cancelling bill request', {}, { feature: 'orders' })
      }
      
      await cancelBillMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to cancel bill request:', error)
    }
  }

  // Navigate to menu to add more items
  const handleAddMoreItems = () => {
    router.push('/menu')
  }

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center justify-between">
          <h2 style={{ color: 'var(--gray-900)' }}>{ORDERS_TEXT.title}</h2>
          
          {/* Real-time Connection Status */}
          {state.currentSessionOrders.length > 0 && (
            <div className="flex items-center gap-2">
              {isRealtimeConnected ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Live</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              ) : connectionStatus === 'connecting' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Session Summary Card - Only show if has orders */}
        {state.currentSessionOrders.length > 0 && (
          <div 
            className="rounded-2xl p-5"
            style={{ 
              background: billRequested 
                ? 'linear-gradient(135deg, var(--gray-600) 0%, var(--gray-700) 100%)' 
                : 'linear-gradient(135deg, var(--orange-500) 0%, var(--orange-600) 100%)',
              color: 'white'
            }}
          >
            {/* Lock Icon when bill requested */}
            {billRequested && (
              <div className="flex items-center gap-2 mb-3 text-sm opacity-90">
                <Lock className="w-4 h-4" />
                <span>Session locked - Bill requested</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Current Session Total</p>
                <p className="text-3xl font-bold">
                  ${sessionSummary.totalAmount.toFixed(2)}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {billRequested ? (
                  <>
                    {/* View Bill Button */}
                    <button
                      onClick={() => router.push('/bill')}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all hover:shadow-lg active:scale-95"
                      style={{ 
                        backgroundColor: 'white',
                        color: 'var(--gray-700)'
                      }}
                    >
                      <Receipt className="w-4 h-4" />
                      View Bill
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRequestBillClick}
                      disabled={state.currentSessionOrders.length === 0}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
                      style={{ 
                        backgroundColor: 'white',
                        color: 'var(--orange-500)'
                      }}
                    >
                      <Receipt className="w-4 h-4" />
                      View Bill
                    </button>
                    {/* Print Bill Button - Only show for served/completed orders when bill not requested */}
                    {sessionSummary.hasServedOrders && (
                      <button
                        onClick={() => router.push('/bill?print=true')}
                        className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg active:scale-95 flex items-center gap-2"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }}
                      >
                        <Printer className="w-4 h-4" />
                        Print Bill
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Session Stats */}
            <div 
              className="flex gap-5 mt-4 pt-4 text-sm"
              style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }}
            >
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 opacity-80" />
                {sessionSummary.orderCount} {sessionSummary.orderCount === 1 ? 'Order' : 'Orders'}
              </span>
              <span className="flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 opacity-80" />
                {sessionSummary.totalItems} {sessionSummary.totalItems === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            
            {/* Bill Request Info Message */}
            {billRequested && (
              <div 
                className="mt-3 p-3 rounded-xl text-sm flex items-start gap-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <Receipt className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  A waiter will bring your bill shortly.
                </span>
              </div>
            )}
            
            {/* Add More Items - Only when not locked */}
            {!billRequested && state.currentSessionOrders.length > 0 && (
              <button
                onClick={handleAddMoreItems}
                className="mt-4 w-full py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-white/20 active:scale-95"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white'
                }}
              >
                <Plus className="w-4 h-4" />
                Add More Items
              </button>
            )}
          </div>
        )}

        {/* Current Session Orders - Inline Tracking */}
        <div>
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '16px' }}>
            {ORDERS_TEXT.currentSession}
          </h3>
          {state.currentSessionOrders.length > 0 ? (
            <div className="space-y-3">
              {state.currentSessionOrders.map((order, index) => (
                <InlineOrderTracking 
                  key={order.id} 
                  order={order}
                  defaultExpanded={index === 0} // Expand most recent order by default
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
              <ClipboardList className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gray-400)' }} />
              <p style={{ color: 'var(--gray-900)' }}>{ORDERS_TEXT.noActiveOrder}</p>
              <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{ORDERS_TEXT.noActiveOrderDesc}</p>
            </div>
          )}
        </div>

        {/* Order History - Simplified cards for past sessions */}
        <div>
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '16px' }}>{ORDERS_TEXT.orderHistory}</h3>
          {!state.isLoggedIn ? (
            <div className="bg-white rounded-xl p-8 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
              <LogIn className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gray-400)' }} />
              <p className="mb-4" style={{ color: 'var(--gray-900)' }}>{ORDERS_TEXT.signInPrompt}</p>
              <button
                onClick={handleLogin}
                className="px-6 py-2 rounded-full"
                style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
              >
                {ORDERS_TEXT.signInButton}
              </button>
            </div>
          ) : state.orderHistory.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
              <p style={{ color: 'var(--gray-600)' }}>{ORDERS_TEXT.noPastOrders}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.orderHistory.map((order) => (
                <div
                  key={order.id}
                  className="w-full bg-white rounded-xl p-4 border"
                  style={{ borderColor: 'var(--gray-200)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p style={{ color: 'var(--gray-900)' }}>Order #{order.id.slice(-8).toUpperCase()}</p>
                    {/* Status Badge */}
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: 'var(--gray-100)',
                        color: 'var(--gray-600)',
                      }}
                    >
                      {order.status}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Review Modal - Shows when Request Bill is clicked */}
    <ReviewServedItemsModal
      open={showReviewModal}
      orders={state.currentSessionOrders}
      onClose={() => setShowReviewModal(false)}
      onSkip={handleSkipReviews}
      onSubmit={handleReviewSubmit}
      isSubmitting={isSubmittingReviews}
    />
    </PageTransition>
  )
}
