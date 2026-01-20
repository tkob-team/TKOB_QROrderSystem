'use client'

import { ArrowLeft, ShoppingBag, ChevronDown, Info, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CartItemCard } from '@/shared/components/cards/CartItemCard'
import { EmptyState } from '@/shared/components/common/EmptyState'
import { PageTransition } from '@/shared/components/transitions/PageTransition'
import { useCartController } from '../../hooks'
import { useCartCheckout } from '../../hooks/useCartCheckout'
import { CartConfirmModal } from '../components/modals/CartConfirmModal'
import type { CartItemResponse } from '../../data/types'
import { colors, shadows, transitions, typography } from '@/styles/design-tokens'

/**
 * Merged Cart + Checkout Page
 * - Cart items with edit/remove
 * - Customer name and notes input
 * - Place Order button (creates order, navigates to Orders page)
 * - Tips and vouchers are moved to Request Bill flow
 */
export function CartPage() {
  const router = useRouter()
  const { items: cartItems, updateQuantity, removeItem, totals } = useCartController()
  const { 
    customerName, 
    notes, 
    setCustomerName, 
    setNotes, 
    handlePlaceOrder, 
    isSubmitting 
  } = useCartCheckout()
  
  const [summaryExpanded, setSummaryExpanded] = useState(true)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const handleMenu = () => {
    router.push(`/menu}`)
  }

  const handleEditItem = (item: CartItemResponse) => {
    router.push(`/menu/${item.menuItemId}`)
  }

  const handleRequestRemove = (itemId: string) => {
    setPendingRemoveId(itemId)
    setIsConfirmOpen(true)
  }

  const handleConfirmRemove = () => {
    if (pendingRemoveId) {
      removeItem(pendingRemoveId)
    }
    setIsConfirmOpen(false)
    setPendingRemoveId(null)
  }

  const handleCancelRemove = () => {
    setIsConfirmOpen(false)
    setPendingRemoveId(null)
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
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: colors.text.primary }} />
            </button>
            <div className="flex-1">
              <h2 
                style={{ 
                  color: colors.text.primary,
                  fontFamily: typography.fontFamily.display,
                  fontSize: '1.25rem',
                  fontWeight: '600',
                }}
              >
                Your Cart
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        {cartItems.length === 0 ? (
          <div className="flex-1">
            <EmptyState
              icon={<ShoppingBag className="w-16 h-16" />}
              title="Your cart is empty"
              message="Add items from the menu to get started"
              actionLabel="Browse menu"
              onAction={handleMenu}
            />
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 p-4 pb-24">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    cartItem={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={() => handleRequestRemove(item.id)}
                    onEdit={handleEditItem}
                  />
                ))}
              </div>

              {/* Special Instructions for Kitchen */}
              <div className="mt-4 bg-white rounded-xl p-4 border" style={{ borderColor: colors.border.light }}>
                <label 
                  className="block mb-2" 
                  style={{ 
                    color: colors.text.primary,
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Special Instructions for Kitchen
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests for the entire order?"
                  className="w-full px-4 py-3 rounded-xl border resize-none focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary,
                    transition: transitions.fast,
                    fontSize: '14px',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary[500];
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border.DEFAULT;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  rows={2}
                />
              </div>

              {/* Order Summary */}
              <div 
                className="mt-4 bg-white rounded-xl border" 
                style={{ 
                  borderColor: colors.border.light,
                  boxShadow: shadows.card,
                }}
              >
                <button
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                  className="w-full p-4 flex items-center justify-between"
                  style={{ transition: transitions.default }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.neutral[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <h3 
                    style={{ 
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.display,
                      fontSize: '1rem',
                      fontWeight: '600',
                    }}
                  >
                    Order Summary
                  </h3>
                  <ChevronDown
                    className="w-5 h-5"
                    style={{ 
                      color: colors.text.muted,
                      transform: summaryExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: transitions.default,
                    }}
                  />
                </button>
                
                {summaryExpanded && (
                  <div className="px-4 pb-4 space-y-2" style={{ fontSize: '14px' }}>
                    <div className="flex justify-between" style={{ color: colors.text.secondary }}>
                      <span>Subtotal</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    {totals.taxRate > 0 && (
                      <div className="flex justify-between" style={{ color: colors.text.secondary }}>
                        <span>Tax ({totals.taxRate}%)</span>
                        <span>${totals.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div 
                      className="border-t pt-2 mt-2 flex justify-between" 
                      style={{ 
                        borderColor: colors.border.DEFAULT,
                        color: colors.text.primary,
                        fontWeight: '600',
                      }}
                    >
                      <span>Total</span>
                      <span style={{ color: colors.primary[600] }}>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pay After Meal Info */}
              <div 
                className="mt-4 p-4 rounded-xl flex items-start gap-3" 
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
                      fontWeight: '600',
                      marginBottom: '4px',
                    }}
                  >
                    Pay After Your Meal
                  </p>
                  <p 
                    style={{ 
                      color: colors.primary[700],
                      fontSize: '13px',
                      lineHeight: '1.5',
                    }}
                  >
                    You can place multiple orders during your visit. Payment will be processed when you request the bill.
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Place Order Button */}
            <div 
              className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t"
              style={{ 
                borderColor: colors.border.DEFAULT,
                boxShadow: shadows.header,
                paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
              }}
            >
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full py-4 px-6 rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  backgroundColor: colors.primary[600],
                  color: 'white',
                  minHeight: '52px',
                  boxShadow: shadows.button,
                  transition: transitions.fast,
                  fontWeight: '600',
                  fontSize: '16px',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = colors.primary[700];
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Place Order · ${totals.total.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        <CartConfirmModal open={isConfirmOpen} onConfirm={handleConfirmRemove} onCancel={handleCancelRemove} />
      </div>
    </PageTransition>
  )
}
