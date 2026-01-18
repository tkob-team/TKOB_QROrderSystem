'use client'

import { useState } from 'react'
import { ArrowLeft, QrCode, Wallet, Loader2, PlusCircle } from 'lucide-react'
import { PageTransition } from '@/shared/components/transitions/PageTransition'
import { useCheckoutController } from '../../hooks'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'
import { useSession } from '@/features/tables/hooks/useSession'
import { colors, shadows, transitions, typography } from '@/styles/design-tokens'

export function CheckoutPage() {
  const { state, updateField, cartItems, tableNumber, total, subtotal, tipAmount, tipPercent, handleSubmit, handleBack, mergeableOrder, isMergeLoading } =
    useCheckoutController()
  
  const { session, loading: sessionLoading } = useSession()
  const { data: paymentMethods, isLoading: isLoadingPayments, error: paymentError } = usePaymentMethods()
  
  // Custom tip input state
  const [customTipInput, setCustomTipInput] = useState('')
  
  // Check if specific payment method is available
  const isSepayAvailable = paymentMethods?.methods?.includes('SEPAY_QR') ?? false
  const isCashAvailable = paymentMethods?.methods?.includes('BILL_TO_TABLE') ?? true // Always true
  const isLoadingMethods = sessionLoading || isLoadingPayments
  
  // Debug log
  console.log('CheckoutPage Debug:', {
    sessionLoading,
    isLoadingPayments,
    sessionTenantId: session?.tenantId,
    paymentMethods: paymentMethods?.methods,
    isSepayAvailable,
    paymentError: paymentError?.message
  })
  
  // No longer auto-default to cash - user must explicitly select payment method
  // Only clear invalid selection if SePay becomes unavailable
  if (!isLoadingMethods && !isSepayAvailable && state.paymentMethod === 'SEPAY_QR') {
    updateField('paymentMethod', null)
  }
  
  // Handle custom tip input change
  const handleCustomTipChange = (value: string) => {
    setCustomTipInput(value)
    const amount = parseFloat(value) || 0
    updateField('customTipAmount', amount)
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background.secondary }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 bg-white border-b p-4" 
        style={{ 
          borderColor: colors.border.DEFAULT,
          boxShadow: shadows.header,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ transition: transitions.fast }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.neutral[100];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Go back to cart"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: colors.text.primary }} />
          </button>
          <h2 
            style={{ 
              color: colors.text.primary,
              fontFamily: typography.fontFamily.display,
              fontSize: '1.25rem',
              fontWeight: '600',
            }}
          >
            Checkout
          </h2>
        </div>
      </div>

      {/* Content - Reserve bottom space for sticky CTA only (BottomNav hidden on checkout) */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        {/* Merge Order Banner - Show when there's an existing unpaid cash order */}
        {mergeableOrder?.hasMergeableOrder && mergeableOrder.existingOrder && (
          <div 
            className="bg-blue-50 border-b p-4" 
            style={{ 
              borderColor: colors.primary[200],
            }}
          >
            <div className="flex items-start gap-3">
              <PlusCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.primary[600] }} />
              <div className="flex-1">
                <p 
                  style={{ 
                    color: colors.primary[800],
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  Gộp vào đơn hàng hiện tại?
                </p>
                <p 
                  style={{ 
                    color: colors.primary[700],
                    fontSize: '13px',
                    lineHeight: '1.4',
                  }}
                >
                  You have an existing order <strong>{mergeableOrder.existingOrder.orderNumber}</strong> ({mergeableOrder.existingOrder.itemCount} items · ${mergeableOrder.existingOrder.total.toFixed(2)}) pending cash payment. 
                  <br />
                  <span style={{ color: colors.primary[600] }}>
                    Choose "Pay at counter" to merge new items into this order.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Strip */}
        <div 
          className="bg-white border-b p-4" 
          style={{ 
            borderColor: colors.border.light,
            boxShadow: shadows.sm,
          }}
        >
          <div className="flex items-center justify-between" style={{ fontSize: '14px' }}>
            <span style={{ color: colors.text.muted }}>
              Table {tableNumber} · {cartItems.length} items
            </span>
            <span 
              style={{ 
                color: colors.primary[600],
                fontWeight: '600',
                fontFamily: typography.fontFamily.display,
              }}
            >
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Single Column Form */}
        <div className="p-4 space-y-4">
          <div>
            <label 
              className="block mb-2" 
              style={{ 
                color: colors.text.primary,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Your name (optional)
            </label>
            <input
              type="text"
              value={state.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., John"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: 'white',
                color: colors.text.primary,
                minHeight: '48px',
                transition: transitions.fast,
                boxShadow: shadows.sm,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary[500];
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border.DEFAULT;
                e.currentTarget.style.boxShadow = shadows.sm;
              }}
              aria-label="Your name"
            />
          </div>

          <div>
            <label 
              className="block mb-2" 
              style={{ 
                color: colors.text.primary,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Notes for the restaurant (optional)
            </label>
            <textarea
              value={state.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="e.g., No spicy, extra napkins..."
              className="w-full px-4 py-3 rounded-xl border resize-none focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: 'white',
                color: colors.text.primary,
                transition: transitions.fast,
                boxShadow: shadows.sm,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary[500];
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border.DEFAULT;
                e.currentTarget.style.boxShadow = shadows.sm;
              }}
              rows={3}
              aria-label="Notes for restaurant"
            />
          </div>

          {/* Tip Section */}
          <div>
            <label 
              className="block mb-3" 
              style={{ 
                color: colors.text.primary,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Add a tip (optional)
            </label>
            
            {/* Tip Percentage Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[0, 0.10, 0.15, 0.20].map((percent) => (
                <button
                  key={percent}
                  onClick={() => {
                    updateField('tipPercent', percent)
                    setCustomTipInput('') // Clear custom input
                  }}
                  className="py-3 px-2 rounded-xl border-2"
                  style={{
                    borderColor: tipPercent === percent ? colors.primary[500] : colors.border.light,
                    backgroundColor: tipPercent === percent ? colors.primary[50] : 'white',
                    color: tipPercent === percent ? colors.primary[700] : colors.text.primary,
                    transition: transitions.fast,
                    fontWeight: '500',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => {
                    if (tipPercent !== percent) {
                      e.currentTarget.style.borderColor = colors.border.dark;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tipPercent !== percent) {
                      e.currentTarget.style.borderColor = colors.border.light;
                    }
                  }}
                  aria-label={percent === 0 ? 'No tip' : `${percent * 100}% tip`}
                >
                  {percent === 0 ? 'No tip' : `${percent * 100}%`}
                </button>
              ))}
            </div>
            
            {/* Custom Tip Input */}
            <div className="mb-2">
              <label 
                className="block mb-2" 
                style={{ 
                  color: colors.text.secondary,
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Or enter custom amount
              </label>
              <div className="relative">
                <span 
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ 
                    color: colors.text.muted,
                    fontSize: '15px',
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customTipInput}
                  onChange={(e) => handleCustomTipChange(e.target.value)}
                  onFocus={() => updateField('tipPercent', 'custom')}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: tipPercent === 'custom' ? colors.primary[500] : colors.border.DEFAULT,
                    backgroundColor: 'white',
                    color: colors.text.primary,
                    minHeight: '48px',
                    transition: transitions.fast,
                    boxShadow: tipPercent === 'custom' ? `0 0 0 3px ${colors.primary[100]}` : shadows.sm,
                  }}
                  onBlur={(e) => {
                    if (tipPercent !== 'custom') {
                      e.currentTarget.style.borderColor = colors.border.DEFAULT;
                      e.currentTarget.style.boxShadow = shadows.sm;
                    }
                  }}
                  aria-label="Custom tip amount"
                />
              </div>
            </div>
            
            {/* Tip Amount Display */}
            {tipAmount > 0 && (
              <div 
                className="text-center p-2 rounded-lg" 
                style={{ 
                  backgroundColor: colors.primary[50],
                  color: colors.primary[700],
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Tip: ${tipAmount.toFixed(2)}
              </div>
            )}
          </div>

          {/* Payment Method - Large Card Selection */}
          <div>
            <label 
              className="block mb-3" 
              style={{ 
                color: colors.text.primary,
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Payment method
            </label>
            
            {/* Loading state */}
            {isLoadingMethods && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.text.light }} />
              </div>
            )}
            
            {/* Payment options */}
            {!isLoadingMethods && (
              <div className="space-y-3">
                {/* Pay now with QR - Only show if SePay is enabled */}
                {isSepayAvailable && (
                  <button
                    onClick={() => updateField('paymentMethod', 'SEPAY_QR')}
                    className="w-full p-4 rounded-xl border-2 flex items-center gap-3"
                    style={{
                      minHeight: '64px',
                      borderColor: state.paymentMethod === 'SEPAY_QR' ? colors.primary[500] : colors.border.light,
                      backgroundColor: state.paymentMethod === 'SEPAY_QR' ? colors.primary[50] : 'white',
                      transition: transitions.fast,
                      boxShadow: state.paymentMethod === 'SEPAY_QR' ? shadows.cardSelected : shadows.card,
                    }}
                    onMouseEnter={(e) => {
                      if (state.paymentMethod !== 'SEPAY_QR') {
                        e.currentTarget.style.borderColor = colors.border.dark;
                        e.currentTarget.style.boxShadow = shadows.cardHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (state.paymentMethod !== 'SEPAY_QR') {
                        e.currentTarget.style.borderColor = colors.border.light;
                        e.currentTarget.style.boxShadow = shadows.card;
                      }
                    }}
                    aria-label="Pay now with QR code"
                    aria-checked={state.paymentMethod === 'SEPAY_QR'}
                    role="radio"
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: state.paymentMethod === 'SEPAY_QR' ? colors.primary[500] : colors.neutral[300],
                      }}
                    >
                      {state.paymentMethod === 'SEPAY_QR' && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: colors.primary[500],
                            animation: 'radio-pop 0.2s ease-out',
                          }} 
                        />
                      )}
                    </div>
                    <QrCode className="w-6 h-6" style={{ color: colors.text.secondary }} />
                    <div className="flex-1 text-left">
                      <div 
                        style={{ 
                          color: colors.text.primary,
                          fontSize: '15px',
                          fontWeight: '500',
                        }}
                      >
                        Pay now with QR
                      </div>
                      <div style={{ color: colors.text.muted, fontSize: '13px' }}>
                        Scan QR with your banking app or e-wallet
                      </div>
                    </div>
                  </button>
                )}

                {/* Pay at counter - Always available */}
                {isCashAvailable && (
                  <button
                    onClick={() => updateField('paymentMethod', 'BILL_TO_TABLE')}
                    className="w-full p-4 rounded-xl border-2 flex items-center gap-3"
                    style={{
                      minHeight: '64px',
                      borderColor: state.paymentMethod === 'BILL_TO_TABLE' ? colors.primary[500] : colors.border.light,
                      backgroundColor: state.paymentMethod === 'BILL_TO_TABLE' ? colors.primary[50] : 'white',
                      transition: transitions.fast,
                      boxShadow: state.paymentMethod === 'BILL_TO_TABLE' ? shadows.cardSelected : shadows.card,
                    }}
                    onMouseEnter={(e) => {
                      if (state.paymentMethod !== 'BILL_TO_TABLE') {
                        e.currentTarget.style.borderColor = colors.border.dark;
                        e.currentTarget.style.boxShadow = shadows.cardHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (state.paymentMethod !== 'BILL_TO_TABLE') {
                        e.currentTarget.style.borderColor = colors.border.light;
                        e.currentTarget.style.boxShadow = shadows.card;
                      }
                    }}
                    aria-label="Pay at counter"
                    aria-checked={state.paymentMethod === 'BILL_TO_TABLE'}
                    role="radio"
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: state.paymentMethod === 'BILL_TO_TABLE' ? colors.primary[500] : colors.neutral[300],
                      }}
                    >
                      {state.paymentMethod === 'BILL_TO_TABLE' && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: colors.primary[500],
                            animation: 'radio-pop 0.2s ease-out',
                          }} 
                        />
                      )}
                    </div>
                    <Wallet className="w-6 h-6" style={{ color: colors.text.secondary }} />
                    <div className="flex-1 text-left">
                      <div 
                        style={{ 
                          color: colors.text.primary,
                          fontSize: '15px',
                          fontWeight: '500',
                        }}
                      >
                        Pay at counter
                      </div>
                      <div style={{ color: colors.text.muted, fontSize: '13px' }}>
                        Cash or card when you leave
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Empty Cart Message */}
        {cartItems.length === 0 && (
          <div 
            className="mx-4 p-4 rounded-xl" 
            style={{ 
              backgroundColor: colors.neutral[100],
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <p style={{ color: colors.text.muted, fontSize: '14px' }}>
              Your cart is empty. Add items from the menu to continue.
            </p>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div 
            className="mx-4 p-4 rounded-xl" 
            style={{ 
              backgroundColor: colors.error.light,
              border: `1px solid ${colors.error.DEFAULT}`,
            }}
          >
            <p style={{ color: colors.error.dark, fontSize: '14px' }}>{state.error}</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA - Full width (BottomNav hidden) */}
      <div 
        className="fixed left-0 right-0 bg-white border-t p-4" 
        style={{ 
          borderColor: colors.border.DEFAULT,
          bottom: 'env(safe-area-inset-bottom)',
          zIndex: 29,
          boxShadow: shadows.navBar,
        }}
      >
        <div className="max-w-[480px] mx-auto">
          <button
            onClick={handleSubmit}
            disabled={state.isSubmitting || cartItems.length === 0 || !state.paymentMethod}
            className="w-full py-3 px-6 rounded-full"
            style={{
              backgroundColor: state.isSubmitting || cartItems.length === 0 || !state.paymentMethod ? colors.neutral[300] : colors.primary[600],
              color: 'white',
              minHeight: '48px',
              boxShadow: state.isSubmitting || cartItems.length === 0 || !state.paymentMethod ? 'none' : shadows.button,
              transition: transitions.fast,
              opacity: state.isSubmitting || cartItems.length === 0 || !state.paymentMethod ? 0.6 : 1,
              cursor: state.isSubmitting || cartItems.length === 0 || !state.paymentMethod ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontFamily: typography.fontFamily.body,
            }}
            onMouseEnter={(e) => {
              if (!state.isSubmitting && cartItems.length > 0 && state.paymentMethod) {
                e.currentTarget.style.backgroundColor = colors.primary[700];
                e.currentTarget.style.boxShadow = shadows.buttonHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!state.isSubmitting && cartItems.length > 0) {
                e.currentTarget.style.backgroundColor = colors.primary[600];
                e.currentTarget.style.boxShadow = shadows.button;
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            onMouseDown={(e) => {
              if (!state.isSubmitting && cartItems.length > 0) {
                e.currentTarget.style.transform = 'scale(0.98)';
              }
            }}
            onMouseUp={(e) => {
              if (!state.isSubmitting && cartItems.length > 0) {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            aria-label={cartItems.length === 0 ? 'Cart is empty' : state.isSubmitting ? 'Creating order' : state.paymentMethod === 'SEPAY_QR' ? 'Continue to payment' : (mergeableOrder?.hasMergeableOrder && state.paymentMethod === 'BILL_TO_TABLE') ? 'Add to existing order' : 'Place order'}
          >
            {cartItems.length === 0
              ? 'Cart is empty'
              : state.isSubmitting
              ? (mergeableOrder?.hasMergeableOrder && state.paymentMethod === 'BILL_TO_TABLE') 
                ? 'Adding to order...' 
                : 'Creating order...'
              : state.paymentMethod === 'SEPAY_QR'
              ? 'Continue to payment'
              : (mergeableOrder?.hasMergeableOrder && state.paymentMethod === 'BILL_TO_TABLE')
              ? 'Add to existing order'
              : 'Place order'}
          </button>
        </div>
      </div>
      
      {/* Animations */}
      <style>{`
        @keyframes radio-pop {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
    </PageTransition>
  )
}
