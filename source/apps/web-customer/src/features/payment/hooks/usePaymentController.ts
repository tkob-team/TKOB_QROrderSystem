"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/tables/hooks/useSession'
import { orderQueryKeys } from '@/features/orders/data/cache/orderQueryKeys'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import type { Order } from '@/types'
import { debugLog, debugError } from '@/lib/debug'
import type { PaymentController, PaymentStatus } from '../model'
import { PaymentDataFactory } from '../data'
import { useOrderStore } from '@/stores/order.store'

interface UsePaymentControllerProps {
  orderId?: string
  order?: Order | null
  onPaymentSuccess?: () => void
  onPaymentFailure?: () => void
}

export function usePaymentController({
  orderId,
  order,
  onPaymentSuccess,
  onPaymentFailure,
}: UsePaymentControllerProps): PaymentController {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { session } = useSession()
  const setPaymentStatus = useOrderStore((state) => state.setPaymentStatus)
  const [paymentStatus, setLocalPaymentStatus] = useState<PaymentStatus>('waiting')
  const [error, setError] = useState<string | null>(null)
  const didStartRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  // Explicit payment starter (idempotent / StrictMode-safe)
  const startPayment = async () => {
    if (didStartRef.current) {
      log('ui', 'Payment already started, skipping duplicate', { orderId: maskId(orderId || '') }, { feature: 'payment', dedupe: true, dedupeTtlMs: 5000 });
      return;
    }
    didStartRef.current = true;

    // Guard: Ensure order exists with valid ID
    const finalOrderId = orderId || order?.id;
    const amount = order?.total;
    
    if (!finalOrderId || !order || !amount) {
      logError('ui', 'Cannot start payment: missing order data', { hasOrderId: !!finalOrderId, hasOrder: !!order, hasAmount: !!amount }, { feature: 'payment' });
      debugError('Payment', 'start_missing_order_data')
      setLocalPaymentStatus('failed');
      setError('Invalid order data. Cannot process payment.');
      return;
    }

    const startTime = Date.now()
    log('data', 'Payment process start', { orderId: maskId(finalOrderId), amount, itemCount: order.items?.length || 0, paymentMethod: order.paymentMethod }, { feature: 'payment' });

    debugLog('Payment', 'start', {
      orderId: maskId(finalOrderId),
      amount: amount,
      itemCount: order.items?.length,
    })

    try {
      const strategy = PaymentDataFactory.getStrategy();
      const response = await strategy.processCardPayment({
        orderId: finalOrderId,
        amount: amount,
        sessionId: session?.tableId,
      });

      log('data', 'Payment response received', { success: response.success, status: response.data?.status, durationMs: Date.now() - startTime }, { feature: 'payment' });

      if (response.success && response.data?.status === 'completed') {
        log('data', 'Payment completed successfully', { orderId: maskId(finalOrderId), durationMs: Date.now() - startTime }, { feature: 'payment' });
        debugLog('Payment', 'success', { orderId: maskId(finalOrderId) })
        setLocalPaymentStatus('success');
        setPaymentStatus('SUCCESS', finalOrderId);
        
        // Invalidate all relevant query keys to refresh order data from storage
        if (session?.tableId) {
          const invalidationKeys = [
            orderQueryKeys.order(finalOrderId),
            orderQueryKeys.orders(session.tableId),
            orderQueryKeys.currentOrder(session.tableId),
            orderQueryKeys.orderHistory(session.tableId),
          ];
          
          // Log cache invalidation with redacted data
          log(
            'data',
            'Invalidating order queries after payment',
            {
              orderId: finalOrderId,
              tableId: session.tableId,
              keyCount: invalidationKeys.length,
            },
            { feature: 'payment', dedupe: false },
          );
          
          // Invalidate all keys
          invalidationKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        } else {
          // No session, just invalidate the specific order
          log(
            'data',
            'Invalidating order query after payment',
            {
              orderId: finalOrderId,
            },
            { feature: 'payment', dedupe: false },
          );
          queryClient.invalidateQueries({ queryKey: orderQueryKeys.order(finalOrderId) });
        }
        
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        logError('data', 'Payment failed', { orderId: maskId(finalOrderId), reason: response.message }, { feature: 'payment' });
        debugLog('Payment', 'failure', {
          orderId: maskId(finalOrderId),
          reason: response.message,
        })
        setLocalPaymentStatus('failed');
        setPaymentStatus('FAILED', finalOrderId);
        setError(response.message || 'Payment processing failed');
        if (onPaymentFailure) {
          onPaymentFailure();
        }
      }
    } catch (err) {
      logError('data', 'Payment error', err, { feature: 'payment' });
      debugError('Payment', 'error', err)
      setLocalPaymentStatus('failed');
      setPaymentStatus('FAILED', finalOrderId);
      setError(err instanceof Error ? err.message : 'Payment processing error');
      if (onPaymentFailure) {
        onPaymentFailure();
      }
    }
  }

  // MOCK payment is now fully manual - no auto-start
  // User must click "Simulate payment success" button

  const state = useMemo(
    () => ({
      paymentStatus,
      error,
      order,
    }),
    [paymentStatus, error, order]
  )

  const goBack = () => {
    router.back()
  }

  const handlePaymentSuccess = () => {
    if (onPaymentSuccess) {
      onPaymentSuccess()
    }
  }

  const handlePaymentFailure = () => {
    if (onPaymentFailure) {
      onPaymentFailure()
    }
  }

  const handleViewOrderStatus = () => {
    if (paymentStatus === 'success') {
      if (onPaymentSuccess) {
        onPaymentSuccess()
      }
    }
  }

  const retryPayment = () => {
    setLocalPaymentStatus('waiting')
    setError(null)
    didStartRef.current = false
  }

  return {
    state,
    actions: {
      goBack,
      handlePaymentSuccess,
      handlePaymentFailure,
      handleViewOrderStatus,
      startPayment,
      retryPayment,
    },
  }
}
