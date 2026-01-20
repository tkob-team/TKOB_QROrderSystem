'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, ShoppingBag, Info } from 'lucide-react'
import { PageTransition } from '@/shared/components/transitions/PageTransition'
import { useCheckoutController } from '../../hooks'
import { useVoucherValidation } from '../../hooks/useVoucherValidation'
import { colors, shadows, transitions, typography } from '@/styles/design-tokens'

/**
 * Simplified Checkout Page
 * - Removed payment method selection (defaults to BILL_TO_TABLE)
 * - Payment happens later via Request Bill flow
 * - Customer just places order, then can order more, then request bill when ready
 */
export function CheckoutPage() {
  const { 
    state, 
    updateField, 
    cartItems, 
    tableNumber, 
    total, 
    subtotal, 
    tipAmount, 
    tipPercent, 
    handleSubmit, 
    handleBack,
  } = useCheckoutController()
  
  const { mutate: validateVoucher, isPending: isValidatingVoucher, reset: resetVoucherValidation } = useVoucherValidation()
  
  // Custom tip input state
  const [customTipInput, setCustomTipInput] = useState('')
  const [voucherError, setVoucherError] = useState<string | null>(null)
  
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
              Place Order
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
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

          {/* Info Banner - Explain new flow */}
          <div 
            className="mx-4 mt-4 p-4 rounded-xl flex items-start gap-3" 
            style={{ 
              backgroundColor: colors.primary[50],
              border: `1px solid ${colors.primary[200]}`,
            }}
          >
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.primary[600] }} />
            <div>
              <p 
                style={{ 
                  color: colors.primary[800],
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                }}
              >
                Order now, pay later
              </p>
              <p 
                style={{ 
                  color: colors.primary[700],
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
              >
                Place your order first. You can order more items during your visit. 
                When you&apos;re ready to leave, tap &quot;Request Bill&quot; on the Orders page to pay for everything at once.
              </p>
            </div>
          </div>

          {/* Form Fields */}
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
                      setCustomTipInput('')
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

            {/* Discount Code Section */}
            <div 
              className="bg-white rounded-xl p-4" 
              style={{ 
                border: `1px solid ${colors.border.light}`,
                boxShadow: shadows.card,
              }}
            >
              <label 
                className="block mb-3" 
                style={{ 
                  color: colors.text.primary,
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Discount code (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter discount code"
                  value={state.discountCode || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const cleanValue = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    updateField('discountCode', cleanValue);
                  }}
                  className="flex-1 px-4 rounded-lg border-2"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    color: colors.text.primary,
                    minHeight: '44px',
                    fontSize: '14px',
                    transition: transitions.fast,
                    textTransform: 'uppercase',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary[500];
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border.DEFAULT;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  aria-label="Discount code"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!state.discountCode || state.discountCode.trim() === '') {
                      setVoucherError('Please enter a voucher code');
                      return;
                    }
                    
                    setVoucherError(null);
                    resetVoucherValidation();
                    
                    validateVoucher(
                      {
                        code: state.discountCode.trim(),
                        orderSubtotal: subtotal,
                      },
                      {
                        onSuccess: (data) => {
                          if (data.valid) {
                            updateField('discountApplied', true);
                            updateField('discountAmount', data.discountAmount ?? 0);
                            updateField('promotionId', data.promotion?.id || null);
                            setVoucherError(null);
                          } else {
                            updateField('discountApplied', false);
                            updateField('discountAmount', 0);
                            updateField('promotionId', null);
                            setVoucherError(data.error || 'Invalid voucher code');
                          }
                        },
                        onError: (error) => {
                          updateField('discountApplied', false);
                          updateField('discountAmount', 0);
                          updateField('promotionId', null);
                          setVoucherError(error.message || 'Failed to validate voucher');
                        },
                      }
                    );
                  }}
                  disabled={isValidatingVoucher || !state.discountCode}
                  className="px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: colors.primary[500],
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '14px',
                    minHeight: '44px',
                    transition: transitions.fast,
                  }}
                  onMouseEnter={(e) => {
                    if (!isValidatingVoucher && state.discountCode) {
                      e.currentTarget.style.backgroundColor = colors.primary[600];
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary[500];
                  }}
                >
                  {isValidatingVoucher ? 'Validating...' : 'Apply'}
                </button>
              </div>
              
              {/* Error Message */}
              {voucherError && (
                <div 
                  className="mt-2 p-2 rounded-lg text-center" 
                  style={{ 
                    backgroundColor: colors.error.light,
                    color: colors.error.dark,
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {voucherError}
                </div>
              )}
              
              {/* Success Message */}
              {state.discountApplied && state.discountAmount > 0 && (
                <div 
                  className="mt-2 p-2 rounded-lg text-center" 
                  style={{ 
                    backgroundColor: colors.success.light,
                    color: colors.success.dark,
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Discount applied: -${state.discountAmount.toFixed(2)}
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

        {/* Sticky Bottom CTA */}
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
              disabled={state.isSubmitting || cartItems.length === 0}
              className="w-full py-3.5 px-6 rounded-full flex items-center justify-center gap-2"
              style={{
                backgroundColor: state.isSubmitting || cartItems.length === 0 ? colors.neutral[300] : colors.primary[600],
                color: 'white',
                minHeight: '52px',
                boxShadow: state.isSubmitting || cartItems.length === 0 ? 'none' : shadows.button,
                transition: transitions.fast,
                opacity: state.isSubmitting || cartItems.length === 0 ? 0.6 : 1,
                cursor: state.isSubmitting || cartItems.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                fontFamily: typography.fontFamily.body,
              }}
              onMouseEnter={(e) => {
                if (!state.isSubmitting && cartItems.length > 0) {
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
              aria-label={cartItems.length === 0 ? 'Cart is empty' : state.isSubmitting ? 'Placing order' : 'Place Order'}
            >
              {state.isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Placing order...
                </>
              ) : cartItems.length === 0 ? (
                'Cart is empty'
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Place Order · ${total.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
