'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, AlertCircle, QrCode, CheckCircle, Clock } from 'lucide-react';
import { mockTable } from '@/lib/mockData';
import type { Order } from '@/types';

interface CardPaymentProps {
  total: number;
  itemCount: number;
  existingOrder?: Order | null;
  onBack: () => void;
  onPaymentSuccess: () => void;
  onPaymentFailure?: () => void;
}

export function CardPaymentPage({ total, itemCount, existingOrder, onBack, onPaymentSuccess, onPaymentFailure }: CardPaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'success' | 'failed'>('waiting');
  const [error, setError] = useState<string | null>(null);

  // Auto-simulate payment success after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate random success/failure for demo
      const success = Math.random() > 0.2;
      
      if (success) {
        setPaymentStatus('success');
      } else {
        setPaymentStatus('failed');
        setError('Payment timed out. Please try again or choose a different payment option.');
        if (onPaymentFailure) {
          onPaymentFailure();
        }
      }
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [onPaymentFailure]);

  const handleViewOrderStatus = () => {
    if (paymentStatus === 'success') {
      onPaymentSuccess();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <h2 style={{ color: 'var(--gray-900)' }}>Payment</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* Order Context (when paying for existing order) */}
          {existingOrder && (
            <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--orange-300)', backgroundColor: 'var(--orange-50)' }}>
              <div className="mb-2" style={{ color: 'var(--orange-900)', fontSize: '15px' }}>
                Order #{existingOrder.id}
              </div>
              <div style={{ color: 'var(--orange-700)', fontSize: '13px' }}>
                Table {existingOrder.tableNumber}
              </div>
              <div className="mt-2 pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--orange-200)' }}>
                <span style={{ color: 'var(--orange-900)', fontSize: '14px' }}>Total</span>
                <span style={{ color: 'var(--orange-900)' }}>${existingOrder.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Summary Card (for new orders) */}
          {!existingOrder && (
            <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                  Table {mockTable.number} · {itemCount} items
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span style={{ color: 'var(--gray-900)' }}>
                  ${total.toFixed(2)}
                </span>
                <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>total</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800" style={{ fontSize: '14px' }}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* QR Payment Section */}
          <div className="bg-white rounded-xl p-6 border text-center" style={{ borderColor: 'var(--gray-200)' }}>
            {/* Status Badge */}
            <div className="flex justify-center mb-4">
              {paymentStatus === 'waiting' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--orange-100)', color: 'var(--orange-700)' }}>
                  <Clock className="w-4 h-4" />
                  <span style={{ fontSize: '14px' }}>Waiting for payment</span>
                </div>
              )}
              {paymentStatus === 'success' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }}>
                  <CheckCircle className="w-4 h-4" />
                  <span style={{ fontSize: '14px' }}>Payment successful</span>
                </div>
              )}
            </div>

            {/* Label above QR */}
            <h3 className="mb-6" style={{ color: 'var(--gray-900)' }}>
              Scan to pay
            </h3>

            {/* Large QR Code Placeholder */}
            <div className="flex justify-center mb-6">
              <div 
                className="rounded-2xl border-2 flex items-center justify-center relative"
                style={{ 
                  borderColor: 'var(--gray-300)',
                  backgroundColor: 'var(--gray-50)',
                  width: '280px',
                  height: '280px',
                }}
              >
                <QrCode className="w-48 h-48" style={{ color: 'var(--gray-400)' }} />
                {/* Success Overlay */}
                {paymentStatus === 'success' && (
                  <div 
                    className="absolute inset-0 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.95)' }}
                  >
                    <CheckCircle className="w-24 h-24" style={{ color: 'white' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Status Message below QR */}
            {paymentStatus === 'waiting' && (
              <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                Payment not completed yet. Please scan the QR code.
              </p>
            )}
            {paymentStatus === 'success' && (
              <p style={{ color: 'var(--emerald-700)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                Your payment has been processed successfully!
              </p>
            )}

            {/* Security note at bottom */}
            <div className="flex items-center justify-center gap-2 pt-6 mt-6 border-t" style={{ borderColor: 'var(--gray-200)' }}>
              <Lock className="w-4 h-4" style={{ color: 'var(--gray-500)' }} />
              <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                Secure payment • QR-based
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="max-w-[480px] mx-auto">
          {paymentStatus === 'waiting' && (
            <button
              disabled
              className="w-full py-3 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--gray-400)',
                color: 'white',
                minHeight: '48px',
              }}
            >
              Waiting for payment…
            </button>
          )}
          {paymentStatus === 'success' && (
            <button
              onClick={handleViewOrderStatus}
              className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--emerald-600)',
                color: 'white',
                minHeight: '48px',
              }}
            >
              View order status
            </button>
          )}
          {paymentStatus === 'failed' && (
            <button
              onClick={onBack}
              className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
              style={{
                backgroundColor: 'var(--orange-500)',
                color: 'white',
                minHeight: '48px',
              }}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}