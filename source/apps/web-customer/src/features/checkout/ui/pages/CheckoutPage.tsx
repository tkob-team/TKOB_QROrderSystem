'use client'

import { ArrowLeft, QrCode, Wallet } from 'lucide-react'
import { useCheckoutController } from '../../hooks'

export function CheckoutPage() {
  const { state, updateField, cartItems, mockTable, total, handleSubmit, handleBack } =
    useCheckoutController()

  return (
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
          <h2 style={{ color: 'var(--gray-900)' }}>Checkout</h2>
        </div>
      </div>

      {/* Content - Reserve bottom space for sticky CTA only (BottomNav hidden on checkout) */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        {/* Summary Strip */}
        <div className="bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-center justify-between" style={{ fontSize: '14px' }}>
            <span style={{ color: 'var(--gray-600)' }}>
              Table {mockTable.number} · {cartItems.length} items
            </span>
            <span style={{ color: 'var(--gray-900)' }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Single Column Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block mb-2" style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
              Your name (optional)
            </label>
            <input
              type="text"
              value={state.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., John"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--orange-500)]"
              style={{
                borderColor: 'var(--gray-300)',
                backgroundColor: 'white',
                color: 'var(--gray-900)',
                minHeight: '48px',
              }}
            />
          </div>

          <div>
            <label className="block mb-2" style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
              Notes for the restaurant (optional)
            </label>
            <textarea
              value={state.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="e.g., No spicy, extra napkins..."
              className="w-full px-4 py-3 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-[var(--orange-500)]"
              style={{
                borderColor: 'var(--gray-300)',
                backgroundColor: 'white',
                color: 'var(--gray-900)',
              }}
              rows={3}
            />
          </div>

          {/* Payment Method - Large Card Selection */}
          <div>
            <label className="block mb-3" style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
              Payment method
            </label>
            <div className="space-y-3">
              {/* Pay now with QR */}
              <button
                onClick={() => updateField('paymentMethod', 'card')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  state.paymentMethod === 'card'
                    ? 'border-[var(--orange-500)] bg-[var(--orange-50)]'
                    : 'border-[var(--gray-200)] hover:border-[var(--gray-300)]'
                }`}
                style={{ minHeight: '64px' }}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    state.paymentMethod === 'card' ? 'border-[var(--orange-500)]' : 'border-[var(--gray-300)]'
                  }`}
                >
                  {state.paymentMethod === 'card' && (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--orange-500)' }} />
                  )}
                </div>
                <QrCode className="w-6 h-6" style={{ color: 'var(--gray-700)' }} />
                <div className="flex-1 text-left">
                  <div style={{ color: 'var(--gray-900)', fontSize: '15px' }}>Pay now with QR</div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                    Scan QR with your banking app or e-wallet
                  </div>
                </div>
              </button>

              {/* Pay at counter */}
              <button
                onClick={() => updateField('paymentMethod', 'counter')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  state.paymentMethod === 'counter'
                    ? 'border-[var(--orange-500)] bg-[var(--orange-50)]'
                    : 'border-[var(--gray-200)] hover:border-[var(--gray-300)]'
                }`}
                style={{ minHeight: '64px' }}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    state.paymentMethod === 'counter' ? 'border-[var(--orange-500)]' : 'border-[var(--gray-300)]'
                  }`}
                >
                  {state.paymentMethod === 'counter' && (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--orange-500)' }} />
                  )}
                </div>
                <Wallet className="w-6 h-6" style={{ color: 'var(--gray-700)' }} />
                <div className="flex-1 text-left">
                  <div style={{ color: 'var(--gray-900)', fontSize: '15px' }}>Pay at counter</div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                    Cash or card when you leave
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Empty Cart Message */}
        {cartItems.length === 0 && (
          <div className="mx-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--gray-100)' }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Your cart is empty. Add items from the menu to continue.</p>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="mx-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--red-50)' }}>
            <p style={{ color: 'var(--red-600)', fontSize: '14px' }}>{state.error}</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA - Full width (BottomNav hidden) */}
      <div className="fixed left-0 right-0 bg-white border-t p-4 shadow-lg" style={{ borderColor: 'var(--gray-200)', bottom: 'env(safe-area-inset-bottom)', zIndex: 29 }}>
        <div className="max-w-[480px] mx-auto">
          <button
            onClick={handleSubmit}
            disabled={state.isSubmitting || cartItems.length === 0}
            className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95 disabled:opacity-60 disabled:hover:shadow-none disabled:active:scale-100"
            style={{
              backgroundColor: state.isSubmitting || cartItems.length === 0 ? 'var(--gray-300)' : 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            {cartItems.length === 0
              ? 'Cart is empty'
              : state.isSubmitting
              ? 'Creating order...'
              : state.paymentMethod === 'card'
              ? 'Continue to payment'
              : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  )
}
