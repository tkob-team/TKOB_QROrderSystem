/**
 * Order Detail Page Header
 * 
 * Simple header with back button and order ID
 */

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderHeaderProps {
  orderId: string;
}

export function OrderHeader({ orderId }: OrderHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
        </button>
        <h2 style={{ color: 'var(--gray-900)' }}>Order #{orderId}</h2>
      </div>
    </div>
  );
}
