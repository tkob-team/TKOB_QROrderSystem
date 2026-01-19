/**
 * Order Detail Page Header
 * 
 * Header with context-aware back button for order detail page
 */

import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface OrderHeaderProps {
  orderId: string;
}

export function OrderHeader({ orderId }: OrderHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // BUG-13 fix: Smart back navigation
  // If came from orders list, go back there. Otherwise go to menu.
  const handleBack = () => {
    const from = searchParams.get('from');
    if (from === 'orders') {
      router.push('/orders');
    } else {
      router.push('/menu');
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
        </button>
        <h2 style={{ color: 'var(--gray-900)' }}>Order #{orderId}</h2>
      </div>
    </div>
  );
}
