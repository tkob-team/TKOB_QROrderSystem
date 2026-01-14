/**
 * Payment Success Banner
 * 
 * Shows animated banner when payment is confirmed
 */

import { CheckCircle } from 'lucide-react';

interface PaymentBannerProps {
  show: boolean;
  isPaid: boolean;
}

export function PaymentBanner({ show, isPaid }: PaymentBannerProps) {
  if (!show || !isPaid) {
    return null;
  }

  return (
    <div 
      className="mb-4 bg-white rounded-xl p-4 border-2 animate-in fade-in slide-in-from-top-2 duration-300"
      style={{ borderColor: 'var(--emerald-500)' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--emerald-100)' }}
        >
          <CheckCircle className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
        </div>
        <div className="flex-1">
          <p style={{ color: 'var(--emerald-900)', fontWeight: 500, fontSize: '15px' }}>
            Payment successful!
          </p>
          <p style={{ color: 'var(--emerald-700)', fontSize: '13px' }}>
            Your order is now paid and will be prepared shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
