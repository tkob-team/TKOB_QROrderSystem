'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, Wallet } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { mockTable } from '../../lib/mockData';

export function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, subtotal, tax, total } = useCart();
  const serviceCharge = subtotal * 0.05;
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'counter'>('counter');

  const handleSubmit = () => {
    // TODO: Call API to place order
    if (paymentMethod === 'card') {
      router.push('/payment/qr');
    } else {
      router.push('/payment/success');
    }
  };

  const handleBack = () => {
    router.back();
  };

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

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'card'
                    ? 'border-[var(--orange-500)] bg-[var(--orange-50)]'
                    : 'border-[var(--gray-200)] hover:border-[var(--gray-300)]'
                }`}
                style={{ minHeight: '64px' }}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'card' ? 'border-[var(--orange-500)]' : 'border-[var(--gray-300)]'
                }`}>
                  {paymentMethod === 'card' && (
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
                onClick={() => setPaymentMethod('counter')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'counter'
                    ? 'border-[var(--orange-500)] bg-[var(--orange-50)]'
                    : 'border-[var(--gray-200)] hover:border-[var(--gray-300)]'
                }`}
                style={{ minHeight: '64px' }}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'counter' ? 'border-[var(--orange-500)]' : 'border-[var(--gray-300)]'
                }`}>
                  {paymentMethod === 'counter' && (
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
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="max-w-[480px] mx-auto">
          <button
            onClick={handleSubmit}
            className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            {paymentMethod === 'card' ? 'Continue to payment' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}