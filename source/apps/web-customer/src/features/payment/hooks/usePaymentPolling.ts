/**
 * Payment Polling Hook
 * Polls SePay API to verify payment confirmation
 * 
 * Pattern copied from web-tenant for consistency
 * - Has maxAttempts limit to prevent infinite loops
 * - Provides progress tracking
 * - Clean separation of polling logic from UI
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { log, logError } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { checkoutApi } from '@/features/checkout/data';

export type PaymentPollingStatus = 
  | 'idle'
  | 'polling'
  | 'confirmed'
  | 'timeout'
  | 'error';

interface UsePaymentPollingOptions {
  /**
   * Payment ID to poll
   */
  paymentId: string | null;
  /**
   * Enable polling
   */
  enabled?: boolean;
  /**
   * Auto-start polling when paymentId becomes available
   * @default false
   */
  autoStart?: boolean;
  /**
   * Polling interval in milliseconds
   * @default 3000 (3 seconds - safe for SePay rate limit)
   */
  interval?: number;
  /**
   * Maximum polling attempts
   * @default 60 (3 minutes with 3s interval)
   */
  maxAttempts?: number;
  /**
   * Callback on success
   */
  onSuccess?: () => void;
  /**
   * Callback on timeout
   */
  onTimeout?: () => void;
  /**
   * Callback on error
   */
  onError?: (error: Error) => void;
}

interface UsePaymentPollingReturn {
  /**
   * Current polling status
   */
  status: PaymentPollingStatus;
  /**
   * Current attempt number
   */
  attempt: number;
  /**
   * Maximum attempts
   */
  maxAttempts: number;
  /**
   * Progress percentage (0-100)
   */
  progress: number;
  /**
   * Start polling
   */
  startPolling: () => void;
  /**
   * Stop polling
   */
  stopPolling: () => void;
  /**
   * Reset to initial state
   */
  reset: () => void;
}

/**
 * Hook for polling payment confirmation via SePay
 * 
 * @example
 * ```tsx
 * const { status, progress, startPolling } = usePaymentPolling({
 *   paymentId: payment.paymentId,
 *   onSuccess: () => {
 *     toast.success('Payment confirmed!');
 *     router.push(`/orders/${orderId}`);
 *   },
 *   onTimeout: () => {
 *     toast.error('Payment verification timeout');
 *   },
 * });
 * ```
 */
export function usePaymentPolling({
  paymentId,
  enabled = true,
  autoStart = false,
  interval = 3000,
  maxAttempts: maxAttemptsOption = 60,
  onSuccess,
  onTimeout,
  onError,
}: UsePaymentPollingOptions): UsePaymentPollingReturn {
  const [status, setStatus] = useState<PaymentPollingStatus>('idle');
  const [attempt, setAttempt] = useState(0);
  const maxAttempts = maxAttemptsOption;
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);
  
  // Keep callbacks in ref to avoid re-creating interval
  const callbacksRef = useRef({ onSuccess, onTimeout, onError });
  useEffect(() => {
    callbacksRef.current = { onSuccess, onTimeout, onError };
  }, [onSuccess, onTimeout, onError]);

  /**
   * Stop polling and cleanup
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Poll once via SePay
   */
  const pollOnce = useCallback(async () => {
    if (!paymentId) {
      log('data', '[polling] No payment ID provided', {}, { feature: 'payment' });
      return false;
    }

    attemptRef.current += 1;
    setAttempt(attemptRef.current);

    log('data', '[polling] CHECK_PAYMENT', {
      paymentId: maskId(paymentId),
      attempt: attemptRef.current,
      maxAttempts,
    }, { feature: 'payment' });

    try {
      // Use SePay polling endpoint which checks actual bank transactions
      const result = await checkoutApi.checkPaymentViaPoll(paymentId);

      if (result.completed) {
        log('data', '[polling] PAYMENT_CONFIRMED', {
          paymentId: maskId(paymentId),
          attempt: attemptRef.current,
        }, { feature: 'payment' });
        
        stopPolling();
        setStatus('confirmed');
        callbacksRef.current.onSuccess?.();
        return true;
      }

      // Check if payment failed
      if (result.status === 'FAILED') {
        log('data', '[polling] PAYMENT_FAILED', {
          paymentId: maskId(paymentId),
          attempt: attemptRef.current,
          message: result.message,
        }, { feature: 'payment' });
        
        stopPolling();
        setStatus('error');
        callbacksRef.current.onError?.(new Error(result.message || 'Payment failed'));
        return true;
      }

      // Check timeout
      if (attemptRef.current >= maxAttempts) {
        log('data', '[polling] PAYMENT_TIMEOUT', {
          paymentId: maskId(paymentId),
          attempts: attemptRef.current,
        }, { feature: 'payment' });
        
        stopPolling();
        setStatus('timeout');
        callbacksRef.current.onTimeout?.();
        return true;
      }

      return false;
    } catch (error) {
      logError('data', `[polling] PAYMENT_CHECK_ERROR - paymentId: ${maskId(paymentId)}, attempt: ${attemptRef.current}`, error, {
        feature: 'payment',
      });

      // Don't stop on transient errors - keep trying
      // Only stop on max attempts
      if (attemptRef.current >= maxAttempts) {
        stopPolling();
        setStatus('error');
        callbacksRef.current.onError?.(
          error instanceof Error ? error : new Error('Payment check failed')
        );
        return true;
      }

      return false;
    }
  }, [paymentId, maxAttempts, stopPolling]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!paymentId || !enabled) {
      log('data', '[polling] Cannot start polling', { 
        hasPaymentId: !!paymentId, 
        enabled 
      }, { feature: 'payment' });
      return;
    }

    if (intervalRef.current) {
      log('data', '[polling] Polling already active', {}, { feature: 'payment' });
      return;
    }

    log('data', '[polling] START_POLLING', {
      paymentId: maskId(paymentId),
      interval,
      maxAttempts,
    }, { feature: 'payment' });

    // Reset state
    attemptRef.current = 0;
    setAttempt(0);
    setStatus('polling');

    // Poll immediately
    pollOnce();

    // Then poll at interval
    intervalRef.current = setInterval(() => {
      pollOnce();
    }, interval);
  }, [paymentId, enabled, interval, maxAttempts, pollOnce]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setAttempt(0);
    attemptRef.current = 0;
  }, [stopPolling]);

  /**
   * Auto-start polling when paymentId becomes available (if autoStart enabled)
   */
  useEffect(() => {
    if (autoStart && paymentId && enabled && status === 'idle') {
      log('data', '[polling] AUTO_START - paymentId available', {
        paymentId: maskId(paymentId),
      }, { feature: 'payment' });
      startPolling();
    }
  }, [autoStart, paymentId, enabled, status, startPolling]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  /**
   * Calculate progress percentage
   */
  const progress = maxAttempts > 0 ? Math.round((attempt / maxAttempts) * 100) : 0;

  return {
    status,
    attempt,
    maxAttempts,
    progress,
    startPolling,
    stopPolling,
    reset,
  };
}
