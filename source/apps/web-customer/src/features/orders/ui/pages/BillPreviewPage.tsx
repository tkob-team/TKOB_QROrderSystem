'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UtensilsCrossed, CreditCard, Receipt, Clock, Wallet, XCircle, Loader2, Heart, Tag, CheckCircle, AlertCircle, QrCode, Banknote, Lock, ShoppingBag, X } from 'lucide-react'
import { PageTransition } from '@/shared/components/transitions/PageTransition'
import { useSession, sessionQueryKey } from '@/features/tables/hooks/useSession'
import { useOrdersController } from '../../hooks'
import { usePaymentMethods } from '@/features/checkout/hooks/usePaymentMethods'
import { useVoucherValidation } from '@/features/checkout/hooks/useVoucherValidation'
import { useCancelBillRequest } from '../../hooks/useCancelBillRequest'
import { orderApi } from '../../data'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Tip percentage options
const TIP_OPTIONS = [
  { percentage: 0, label: 'No tip' },
  { percentage: 10, label: '10%' },
  { percentage: 15, label: '15%' },
  { percentage: 20, label: '20%' },
] as const

// Payment method definitions
const PAYMENT_METHODS = {
  SEPAY_QR: { id: 'SEPAY_QR', label: 'VietQR', icon: QrCode, description: 'Pay instantly with QR' },
  BILL_TO_TABLE: { id: 'BILL_TO_TABLE', label: 'Cash', icon: Banknote, description: 'Pay at counter' },
} as const

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch {
    return ''
  }
}

/**
 * Bill Preview Page
 * Shows consolidated bill for all orders in the current session
 * Similar to mockup payment.html - displays all orders grouped with totals
 */
export function BillPreviewPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { session } = useSession()
  const { state } = useOrdersController()
  const { data: paymentMethods } = usePaymentMethods()
  const cancelBillMutation = useCancelBillRequest()
  const voucherMutation = useVoucherValidation()

  // Check if payment methods are available
  const isSepayAvailable = paymentMethods?.methods?.includes('SEPAY_QR') ?? false

  // Payment confirmation state
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false)
  const [showPayConfirmDialog, setShowPayConfirmDialog] = useState(false)

  // Tip state
  const [selectedTipIndex, setSelectedTipIndex] = useState<number>(0) // Default: No tip
  const [customTipAmount, setCustomTipAmount] = useState<string>('')
  const [showCustomTip, setShowCustomTip] = useState(false)

  // Voucher state
  const [voucherCode, setVoucherCode] = useState<string>('')
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0)
  const [voucherStatus, setVoucherStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [voucherMessage, setVoucherMessage] = useState<string>('')

  // Payment method selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('BILL_TO_TABLE')
  
  // Check if bill was already requested from session
  const billRequested = session?.billRequestedAt != null

  // Calculate tip amount
  const tipAmount = useMemo(() => {
    // Check if orders already have saved tip (payment was confirmed)
    const savedTip = state.currentSessionOrders.reduce((sum, order) => sum + (order.tip || 0), 0)
    
    // If orders have tip, always use it (payment was already confirmed)
    if (savedTip > 0) {
      return savedTip
    }
    
    // Otherwise, calculate from user selection
    if (showCustomTip && customTipAmount) {
      const custom = parseFloat(customTipAmount)
      return isNaN(custom) ? 0 : custom
    }
    const orders = state.currentSessionOrders
    const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0)
    return (subtotal * TIP_OPTIONS[selectedTipIndex].percentage) / 100
  }, [showCustomTip, customTipAmount, selectedTipIndex, state.currentSessionOrders])

  // Calculate bill summary
  const billSummary = useMemo(() => {
    const orders = state.currentSessionOrders
    const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0)
    const tax = orders.reduce((sum, order) => sum + order.tax, 0)
    const serviceCharge = orders.reduce((sum, order) => sum + order.serviceCharge, 0)
    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0)
    
    // Check if orders have saved tip (payment was confirmed)
    const hasSavedTip = orders.some(order => (order.tip || 0) > 0)
    
    // If orders have saved tip, use backend totals
    if (hasSavedTip || billRequested) {
      const total = orders.reduce((sum, order) => sum + order.total, 0)
      
      // Use discount from orders if available, otherwise use UI voucherDiscount
      const savedDiscount = orders.reduce((sum, order) => sum + (order.discount || 0), 0) || voucherDiscount
      
      return {
        orders,
        subtotal,
        tax,
        serviceCharge,
        tip: tipAmount, // Already calculated from saved tips
        discount: savedDiscount, // Calculate discount from the difference
        total,
        totalItems,
        orderCount: orders.length,
      }
    }
    
    // Otherwise, calculate from current UI selections
    const baseTotal = orders.reduce((sum, order) => sum + order.total, 0)
    const totalWithTip = baseTotal + tipAmount - voucherDiscount

    return {
      orders,
      subtotal,
      tax,
      serviceCharge,
      tip: tipAmount,
      discount: voucherDiscount,
      total: Math.max(0, totalWithTip), // Ensure total doesn't go negative
      totalItems,
      orderCount: orders.length,
    }
  }, [state.currentSessionOrders, tipAmount, voucherDiscount])

  // Validate voucher via backend API
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return
    
    setVoucherStatus('checking')
    
    try {
      const result = await voucherMutation.mutateAsync({
        code: voucherCode.trim().toUpperCase(),
        orderSubtotal: billSummary.subtotal,
      })
      
      if (result.valid && result.discountAmount != null) {
        setVoucherDiscount(result.discountAmount)
        setVoucherStatus('valid')
        setVoucherMessage(result.promotion?.type === 'PERCENTAGE' 
          ? `${result.promotion.value}% off your order!` 
          : `$${result.discountAmount.toFixed(2)} off your order!`)
      } else {
        setVoucherDiscount(0)
        setVoucherStatus('invalid')
        setVoucherMessage(result.error || 'Invalid or expired voucher code')
      }
    } catch (error: any) {
      setVoucherDiscount(0)
      setVoucherStatus('invalid')
      setVoucherMessage(error.message || 'Failed to validate voucher')
    }
  }

  const handleRemoveVoucher = () => {
    setVoucherCode('')
    setVoucherDiscount(0)
    setVoucherStatus('idle')
    setVoucherMessage('')
  }

  const handleBack = () => {
    router.push('/orders')
  }

  // Show confirmation dialog before paying
  const handlePayNow = () => {
    setShowPayConfirmDialog(true)
  }

  // Actually process payment after confirmation
  const handleConfirmPay = async () => {
    setShowPayConfirmDialog(false)
    
    // Find first unpaid order
    const unpaidOrder = state.currentSessionOrders.find(
      order => order.paymentStatus?.toUpperCase() !== 'COMPLETED' && order.paymentStatus?.toUpperCase() !== 'PAID'
    )
    const targetOrderId = unpaidOrder?.id || state.currentSessionOrders[0]?.id
    
    if (!targetOrderId) return

    setIsConfirmingPayment(true)
    
    try {
      // Build payment URL with parameters
      const tipParam = tipAmount > 0 ? `&tip=${tipAmount.toFixed(2)}` : ''
      const discountParam = voucherDiscount > 0 ? `&discount=${voucherDiscount.toFixed(2)}` : ''
      const voucherParam = voucherCode && voucherStatus === 'valid' ? `&voucher=${encodeURIComponent(voucherCode)}` : ''
      
      // For BILL_TO_TABLE (Cash): Confirm payment immediately (locks session + notifies staff)
      // Then navigate to success page - no need for /payment page
      // For SEPAY_QR: Navigate to payment page, confirmSessionPayment called after polling success
      if (selectedPaymentMethod === 'BILL_TO_TABLE') {
        await orderApi.confirmSessionPayment(
          'CASH',
          tipAmount,
          voucherDiscount,
          voucherCode && voucherStatus === 'valid' ? voucherCode : undefined,
        )
        // Invalidate session to refresh billRequestedAt
        queryClient.invalidateQueries({ queryKey: sessionQueryKey })
        // Navigate to orders page to show payment confirmed state
        router.push('/orders')
        return
      }
      
      // Navigate to payment page (for SEPAY_QR only)
      router.push(`/payment?orderId=${targetOrderId}&paymentMethod=${selectedPaymentMethod}&source=bill${tipParam}${discountParam}${voucherParam}`)
    } catch (error) {
      console.error('Failed to confirm payment:', error)
      toast.error('Failed to process payment. Please try again.')
    } finally {
      setIsConfirmingPayment(false)
    }
  }

  // Handle Cancel Bill Request - allows customer to order more
  const handleCancelBillRequest = async () => {
    try {
      await cancelBillMutation.mutateAsync()
      // Navigate back to menu to continue ordering
      router.push('/menu')
    } catch (error) {
      console.error('Failed to cancel bill request:', error)
    }
  }

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--orange-500)' }}></div>
          <p style={{ color: 'var(--gray-600)' }}>Loading your bill...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (state.currentSessionOrders.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
              </button>
              <h2 style={{ color: 'var(--gray-900)' }}>Your Bill</h2>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <Receipt className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--gray-300)' }} />
              <h3 className="mb-2" style={{ color: 'var(--gray-900)', fontSize: '18px' }}>No orders yet</h3>
              <p style={{ color: 'var(--gray-500)' }}>Place an order to see your bill here</p>
              <button
                onClick={() => router.push('/menu')}
                className="mt-6 px-6 py-3 rounded-full"
                style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
              >
                Browse Menu
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
        {/* Header */}
        <div 
          className="sticky top-0 z-10 p-4 flex items-center justify-between"
          style={{ 
            background: 'linear-gradient(135deg, var(--orange-500) 0%, var(--orange-600) 100%)',
            color: 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold">Your Bill</h2>
          </div>
          {session?.tableId && (
            <span 
              className="px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              Table {session.tableId.slice(-4)}
            </span>
          )}
        </div>

        {/* Bill Content */}
        <div className="flex-1 p-4 pb-32">
          {/* Restaurant Header */}
          <div 
            className="text-center py-6 border-b-2 mb-4"
            style={{ borderStyle: 'dashed', borderColor: 'var(--gray-200)' }}
          >
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--orange-500)' }} />
            <h3 className="text-xl font-bold" style={{ color: 'var(--gray-900)' }}>Smart Restaurant</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>
              {session?.tableId && `Table ${session.tableId.slice(-4)} | `}
              {formatDate(new Date())}
            </p>
          </div>

          {/* Orders List */}
          {billSummary.orders.map((order, index) => (
            <div 
              key={order.id} 
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium" style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                  Order #{index + 1}
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--gray-400)' }}>
                  <Clock className="w-3 h-3" />
                  {formatTime(order.createdAt)}
                </span>
              </div>
              
              {/* Order Items */}
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <span 
                        className="font-medium"
                        style={{ color: 'var(--orange-500)', minWidth: '24px' }}
                      >
                        {item.quantity}x
                      </span>
                      <div>
                        <p style={{ color: 'var(--gray-900)' }}>{item.name}</p>
                        {item.size && (
                          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                            {item.size}
                          </p>
                        )}
                        {item.toppings && item.toppings.length > 0 && (
                          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                            + {item.toppings.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span style={{ color: 'var(--gray-900)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bill Totals */}
          <div 
            className="pt-4 mt-4 border-t-2 space-y-2"
            style={{ borderStyle: 'dashed', borderColor: 'var(--gray-200)' }}
          >
            <div className="flex justify-between" style={{ color: 'var(--gray-600)' }}>
              <span>Subtotal</span>
              <span>${billSummary.subtotal.toFixed(2)}</span>
            </div>
            {billSummary.serviceCharge > 0 && (
              <div className="flex justify-between" style={{ color: 'var(--gray-600)' }}>
                <span>Service Charge</span>
                <span>${billSummary.serviceCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between" style={{ color: 'var(--gray-600)' }}>
              <span>Tax (10%)</span>
              <span>${billSummary.tax.toFixed(2)}</span>
            </div>
            {billSummary.tip > 0 && (
              <div className="flex justify-between" style={{ color: 'var(--green-600)' }}>
                <span>Tip</span>
                <span>+${billSummary.tip.toFixed(2)}</span>
              </div>
            )}
            {billSummary.discount > 0 && (
              <div className="flex justify-between" style={{ color: 'var(--emerald-600)' }}>
                <span>Voucher Discount</span>
                <span>-${billSummary.discount.toFixed(2)}</span>
              </div>
            )}
            <div 
              className="flex justify-between pt-3 mt-2 border-t-2 text-lg font-bold"
              style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}
            >
              <span>Total</span>
              <span>${billSummary.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Tip Selection Section - Only show when payment NOT confirmed */}
          {!billRequested ? (
          <div 
            className="mt-6 p-4 rounded-xl bg-white"
            style={{ 
              border: '1px solid var(--gray-200)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5" style={{ color: 'var(--orange-500)' }} />
              <h4 className="font-semibold" style={{ color: 'var(--gray-900)' }}>Add a tip?</h4>
            </div>
            
            {/* Tip percentage buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {TIP_OPTIONS.map((option, index) => (
                <button
                  key={option.percentage}
                  onClick={() => {
                    setSelectedTipIndex(index)
                    setShowCustomTip(false)
                    setCustomTipAmount('')
                  }}
                  className="py-2.5 px-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: !showCustomTip && selectedTipIndex === index 
                      ? 'var(--orange-500)' 
                      : 'var(--gray-100)',
                    color: !showCustomTip && selectedTipIndex === index 
                      ? 'white' 
                      : 'var(--gray-700)',
                    border: !showCustomTip && selectedTipIndex === index
                      ? '2px solid var(--orange-500)'
                      : '2px solid transparent'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Custom tip option */}
            <button
              onClick={() => {
                setShowCustomTip(true)
              }}
              className="w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all mb-2"
              style={{
                backgroundColor: showCustomTip ? 'var(--orange-50)' : 'var(--gray-50)',
                color: showCustomTip ? 'var(--orange-600)' : 'var(--gray-600)',
                border: showCustomTip 
                  ? '2px solid var(--orange-500)' 
                  : '2px solid var(--gray-200)'
              }}
            >
              Custom Amount
            </button>
            
            {/* Custom tip input */}
            {showCustomTip && (
              <div className="flex items-center gap-2 mt-3">
                <span style={{ color: 'var(--gray-500)' }}>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter tip amount"
                  value={customTipAmount}
                  onChange={(e) => setCustomTipAmount(e.target.value)}
                  className="flex-1 py-2 px-3 rounded-lg text-sm"
                  style={{
                    border: '1px solid var(--gray-300)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--orange-500)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gray-300)'
                  }}
                />
              </div>
            )}
            
            {/* Tip preview */}
            {billSummary.tip > 0 && (
              <p className="text-sm mt-3 text-center" style={{ color: 'var(--gray-500)' }}>
                Thank you for your generosity! 💚
              </p>
            )}
          </div>
          ) : billSummary.tip > 0 ? (
            /* Show confirmed tip as read-only */
            <div 
              className="mt-6 p-4 rounded-xl bg-white"
              style={{ border: '1px solid var(--gray-200)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5" style={{ color: 'var(--green-500)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--gray-900)' }}>Tip Added</h4>
              </div>
              <div 
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--green-50)', border: '1px solid var(--green-200)' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: 'var(--green-600)' }} />
                  <span style={{ color: 'var(--green-700)' }}>Thank you for your generosity!</span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--green-700)' }}>
                  +${billSummary.tip.toFixed(2)}
                </span>
              </div>
            </div>
          ) : null}

          {/* Voucher Section - Only show when payment NOT confirmed */}
          {!billRequested ? (
          <div 
            className="mt-6 p-4 rounded-xl bg-white"
            style={{ 
              border: '1px solid var(--gray-200)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5" style={{ color: 'var(--orange-500)' }} />
              <h4 className="font-semibold" style={{ color: 'var(--gray-900)' }}>Have a voucher?</h4>
            </div>
            
            {voucherStatus === 'valid' ? (
              // Show applied voucher
              <div 
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--emerald-50)', border: '1px solid var(--emerald-200)' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--emerald-900)' }}>{voucherCode}</p>
                    <p className="text-sm" style={{ color: 'var(--emerald-700)' }}>{voucherMessage}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveVoucher}
                  className="p-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                >
                  <XCircle className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
                </button>
              </div>
            ) : (
              // Voucher input form
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter voucher code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={voucherStatus === 'checking'}
                    className="flex-1 py-2.5 px-3 rounded-lg text-sm uppercase"
                    style={{
                      border: voucherStatus === 'invalid' 
                        ? '1px solid var(--red-300)' 
                        : '1px solid var(--gray-300)',
                      outline: 'none',
                      backgroundColor: voucherStatus === 'checking' ? 'var(--gray-100)' : 'white',
                    }}
                    onFocus={(e) => {
                      if (voucherStatus !== 'checking') {
                        e.currentTarget.style.borderColor = 'var(--orange-500)'
                      }
                    }}
                    onBlur={(e) => {
                      if (voucherStatus !== 'invalid') {
                        e.currentTarget.style.borderColor = 'var(--gray-300)'
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyVoucher()
                      }
                    }}
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={!voucherCode.trim() || voucherStatus === 'checking'}
                    className="px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--orange-500)',
                      color: 'white',
                    }}
                  >
                    {voucherStatus === 'checking' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                
                {voucherStatus === 'invalid' && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--red-600)' }}>
                    <AlertCircle className="w-4 h-4" />
                    <span>{voucherMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          ) : billSummary.discount > 0 ? (
            /* Show confirmed discount as read-only */
            <div 
              className="mt-6 p-4 rounded-xl bg-white"
              style={{ border: '1px solid var(--gray-200)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5" style={{ color: 'var(--emerald-500)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--gray-900)' }}>Voucher Applied</h4>
              </div>
              <div 
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--emerald-50)', border: '1px solid var(--emerald-200)' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
                  <span style={{ color: 'var(--emerald-700)' }}>Discount applied to your order</span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--emerald-700)' }}>
                  -${billSummary.discount.toFixed(2)}
                </span>
              </div>
            </div>
          ) : null}

          {/* Payment Method Selection - Only show when payment NOT confirmed */}
          {!billRequested && (
          <div 
            className="mt-6 p-4 rounded-xl bg-white"
            style={{ 
              border: '1px solid var(--gray-200)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" style={{ color: 'var(--orange-500)' }} />
              <h4 className="font-semibold" style={{ color: 'var(--gray-900)' }}>Payment Method</h4>
            </div>
            
            <div className="space-y-2">
              {/* VietQR Option */}
              {isSepayAvailable && (
                <button
                  onClick={() => setSelectedPaymentMethod('SEPAY_QR')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: selectedPaymentMethod === 'SEPAY_QR' ? 'var(--orange-50)' : 'var(--gray-50)',
                    border: selectedPaymentMethod === 'SEPAY_QR' 
                      ? '2px solid var(--orange-500)' 
                      : '2px solid transparent',
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: selectedPaymentMethod === 'SEPAY_QR' 
                        ? 'var(--orange-500)' 
                        : 'var(--gray-200)' 
                    }}
                  >
                    <QrCode 
                      className="w-5 h-5" 
                      style={{ 
                        color: selectedPaymentMethod === 'SEPAY_QR' ? 'white' : 'var(--gray-600)' 
                      }} 
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p 
                      className="font-medium" 
                      style={{ 
                        color: selectedPaymentMethod === 'SEPAY_QR' 
                          ? 'var(--orange-700)' 
                          : 'var(--gray-900)' 
                      }}
                    >
                      VietQR
                    </p>
                    <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                      Pay instantly with QR code
                    </p>
                  </div>
                  {selectedPaymentMethod === 'SEPAY_QR' && (
                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--orange-500)' }} />
                  )}
                </button>
              )}
              
              {/* Cash/Counter Option */}
              <button
                onClick={() => setSelectedPaymentMethod('BILL_TO_TABLE')}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: selectedPaymentMethod === 'BILL_TO_TABLE' ? 'var(--orange-50)' : 'var(--gray-50)',
                  border: selectedPaymentMethod === 'BILL_TO_TABLE' 
                    ? '2px solid var(--orange-500)' 
                    : '2px solid transparent',
                }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: selectedPaymentMethod === 'BILL_TO_TABLE' 
                      ? 'var(--orange-500)' 
                      : 'var(--gray-200)' 
                  }}
                >
                  <Banknote 
                    className="w-5 h-5" 
                    style={{ 
                      color: selectedPaymentMethod === 'BILL_TO_TABLE' ? 'white' : 'var(--gray-600)' 
                    }} 
                  />
                </div>
                <div className="flex-1 text-left">
                  <p 
                    className="font-medium" 
                    style={{ 
                      color: selectedPaymentMethod === 'BILL_TO_TABLE' 
                        ? 'var(--orange-700)' 
                        : 'var(--gray-900)' 
                    }}
                  >
                    Cash
                  </p>
                  <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
                    Pay at counter or with waiter
                  </p>
                </div>
                {selectedPaymentMethod === 'BILL_TO_TABLE' && (
                  <CheckCircle className="w-5 h-5" style={{ color: 'var(--orange-500)' }} />
                )}
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Bottom Action Button */}
        <div 
          className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t space-y-3"
          style={{ borderColor: 'var(--gray-200)' }}
        >
          {/* Session locked - show view-only mode */}
          {billRequested ? (
            <div className="space-y-3">
              <div 
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-700)', border: '1px solid var(--emerald-200)' }}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Payment confirmed - A waiter will assist you shortly</span>
              </div>
              <button
                onClick={() => router.push('/orders')}
                className="w-full py-4 rounded-full flex items-center justify-center gap-2 font-semibold transition-all"
                style={{ 
                  backgroundColor: 'var(--gray-100)',
                  color: 'var(--gray-700)',
                  fontSize: '16px'
                }}
              >
                <Receipt className="w-5 h-5" />
                Back to Orders
              </button>
            </div>
          ) : (
            <button
              onClick={handlePayNow}
              disabled={isConfirmingPayment}
              className="w-full py-4 rounded-full flex items-center justify-center gap-2 font-semibold transition-all hover:shadow-lg active:scale-95 disabled:opacity-70"
              style={{ 
                backgroundColor: 'var(--orange-500)',
                color: 'white',
                fontSize: '16px'
              }}
            >
              {isConfirmingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : selectedPaymentMethod === 'SEPAY_QR' ? (
                <>
                  <QrCode className="w-5 h-5" />
                  Pay ${billSummary.total.toFixed(2)} with QR
                </>
              ) : (
                <>
                  <Receipt className="w-5 h-5" />
                  Pay ${billSummary.total.toFixed(2)} with Cash
                </>
              )}
            </button>
          )}
        </div>

        {/* Payment Confirmation Dialog */}
        {showPayConfirmDialog && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowPayConfirmDialog(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--orange-100)' }}
                >
                  {selectedPaymentMethod === 'SEPAY_QR' ? (
                    <QrCode className="w-8 h-8" style={{ color: 'var(--orange-500)' }} />
                  ) : (
                    <Banknote className="w-8 h-8" style={{ color: 'var(--orange-500)' }} />
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--gray-900)' }}>
                  Confirm Payment?
                </h3>
                <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
                  {selectedPaymentMethod === 'SEPAY_QR' 
                    ? 'You will be shown a QR code to complete payment.'
                    : 'A waiter will come to your table to collect payment.'}
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--gray-500)' }}>
                  After confirming, you won&apos;t be able to order more food.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleConfirmPay}
                  className="w-full py-3 rounded-full font-semibold transition-all hover:shadow-lg"
                  style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
                >
                  Yes, Proceed to Pay ${billSummary.total.toFixed(2)}
                </button>
                <button
                  onClick={() => {
                    setShowPayConfirmDialog(false)
                    router.push('/menu')
                  }}
                  className="w-full py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)' }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Order More Food
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
