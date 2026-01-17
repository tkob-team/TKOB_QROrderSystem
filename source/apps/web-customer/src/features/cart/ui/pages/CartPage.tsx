'use client'

import { ArrowLeft, ShoppingBag, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CartItemCard } from '@/shared/components/cards/CartItemCard'
import { EmptyState } from '@/shared/components/common/EmptyState'
import { PageTransition } from '@/shared/components/transitions/PageTransition'
import { useCartController } from '../../hooks'
import { CartConfirmModal } from '../components/modals/CartConfirmModal'
import type { CartItemResponse } from '../../data/types'
import { colors, shadows, transitions, typography } from '@/styles/design-tokens'

export function CartPage() {
  const router = useRouter()
  const { items: cartItems, updateQuantity, removeItem, totals } = useCartController()
  const [summaryExpanded, setSummaryExpanded] = useState(true)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleBack = () => {
    router.back()
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

  const handleCheckout = () => {
    router.push('/checkout')
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
            style={{
              transition: transitions.fast,
            }}
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
              Your order
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
            onAction={handleBack}
          />
        </div>
      ) : (
        <>
          {/* Cart Items - Single Column */}
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

            {/* Order Summary - Collapsible Accordion */}
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
                style={{
                  transition: transitions.default,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-expanded={summaryExpanded}
                aria-label="Toggle order summary"
              >
                <h3 
                  style={{ 
                    color: colors.text.primary,
                    fontFamily: typography.fontFamily.display,
                    fontSize: '1rem',
                    fontWeight: '600',
                  }}
                >
                  Order summary
                </h3>
                <ChevronDown
                  className={`w-5 h-5`}
                  style={{ 
                    color: colors.text.muted,
                    transform: summaryExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: transitions.default,
                  }}
                />
              </button>
              
              {summaryExpanded && (
                <div 
                  className="px-4 pb-4 space-y-2" 
                  style={{ 
                    fontSize: '14px',
                    animation: 'slideDown 0.2s ease-out',
                  }}
                >
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
                  {totals.serviceChargeRate > 0 && (
                    <div className="flex justify-between" style={{ color: colors.text.secondary }}>
                      <span>Service charge ({totals.serviceChargeRate}%)</span>
                      <span>${totals.serviceCharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div 
                    className="border-t pt-2 mt-2 flex justify-between" 
                    style={{ 
                      borderColor: colors.border.DEFAULT,
                      color: colors.text.primary,
                      fontWeight: '600',
                      fontFamily: typography.fontFamily.display,
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: colors.primary[600] }}>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <div className="mt-4">
              <button
                onClick={handleCheckout}
                className="w-full py-3 px-6 rounded-full"
                style={{
                  backgroundColor: colors.primary[600],
                  color: 'white',
                  minHeight: '48px',
                  boxShadow: shadows.button,
                  transition: transitions.fast,
                  fontWeight: '600',
                  fontFamily: typography.fontFamily.body,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[700];
                  e.currentTarget.style.boxShadow = shadows.buttonHover;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                  e.currentTarget.style.boxShadow = shadows.button;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                aria-label="Proceed to checkout"
              >
                Go to checkout
              </button>
            </div>
          </div>
        </>
      )}

      <CartConfirmModal open={isConfirmOpen} onConfirm={handleConfirmRemove} onCancel={handleCancelRemove} />
    </div>
    </PageTransition>
  )
}
