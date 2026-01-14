/**
 * Payment verification hook for order detail page
 * 
 * Handles:
 * - Detecting ?paid=1 query param
 * - Refetching order to verify payment status
 * - Showing payment success banner
 * - Cleaning up query params
 * 
 * Usage:
 *   const { showPaymentBanner } = usePaymentVerification({ orderId, searchParams, refetch });
 */

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { log } from '@/shared/logging/logger';

interface UsePaymentVerificationProps {
  orderId: string;
  searchParams: ReadonlyURLSearchParams;
  refetch: () => Promise<any>;
}

interface UsePaymentVerificationReturn {
  showPaymentBanner: boolean;
}

export function usePaymentVerification({
  orderId,
  searchParams,
  refetch,
}: UsePaymentVerificationProps): UsePaymentVerificationReturn {
  const [showPaymentBanner, setShowPaymentBanner] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    const paid = searchParams.get('paid');
    
    // Only run once per mount
    if (paid !== '1' || paymentVerified) {
      return;
    }

    log('ui', 'Payment verification triggered', { hasPaidParam: true }, { feature: 'orders', dedupe: false });

    // Refetch to get latest order state from storage
    refetch().then((result) => {
      if (result.data && result.data.paymentStatus === 'Paid') {
        // Payment is confirmed as Paid - show banner and mark as verified
        setPaymentVerified(true);
        setShowPaymentBanner(true);

        // Remove the query param
        const url = new URL(window.location.href);
        url.searchParams.delete('paid');
        window.history.replaceState({}, '', url.toString());

        log('ui', 'Payment verified', { isPaid: true, showBanner: true }, { feature: 'orders' });

        // Auto-hide banner after 5 seconds
        const timer = setTimeout(() => {
          setShowPaymentBanner(false);
        }, 5000);

        return () => clearTimeout(timer);
      } else if (result.data) {
        // Payment not yet reflected in storage, remove param and don't show banner
        log('ui', 'Payment verified', { isPaid: false, showBanner: false, status: result.data.paymentStatus }, { feature: 'orders' });
        const url = new URL(window.location.href);
        url.searchParams.delete('paid');
        window.history.replaceState({}, '', url.toString());
        setPaymentVerified(true);
      }
    });
  }, [searchParams, refetch, paymentVerified]);

  return { showPaymentBanner };
}
