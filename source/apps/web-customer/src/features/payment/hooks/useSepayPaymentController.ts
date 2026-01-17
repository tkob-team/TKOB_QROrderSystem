// SePay Payment Controller - handles VietQR payment flow
// Uses usePaymentPolling hook for consistent polling behavior (with maxAttempts limit)

"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { checkoutApi } from '@/features/checkout/data'
import { usePaymentPolling } from './usePaymentPolling'
import type { PaymentIntentResponse } from '@/features/checkout/data'

export type SepayPaymentStatus = 
  | 'loading'      // Creating payment intent
  | 'waiting'      // QR displayed, waiting for payment
  | 'processing'   // Payment being verified
  | 'success'      // Payment completed
  | 'failed'       // Payment failed
  | 'expired'      // Payment expired (timeout or QR expired)

interface UseSepayPaymentResult {
  // State
  status: SepayPaymentStatus
  error: string | null
  paymentIntent: PaymentIntentResponse | null
  timeRemaining: number // seconds until expiry
  pollingProgress: number // 0-100% polling progress
  pollingAttempt: number // current polling attempt
  pollingMaxAttempts: number // max polling attempts
  
  // Actions
  createPaymentIntent: () => Promise<void>
  retryPayment: () => void
  goToOrderTracking: () => void
  goBack: () => void
}

export function useSepayPaymentController(): UseSepayPaymentResult {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [status, setStatus] = useState<SepayPaymentStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Use the payment polling hook (same pattern as web-tenant)
  // autoStart=true means polling starts automatically when paymentId becomes available
  const {
    status: pollingStatus,
    attempt: pollingAttempt,
    maxAttempts: pollingMaxAttempts,
    progress: pollingProgress,
    startPolling,
    stopPolling,
    reset: resetPolling,
  } = usePaymentPolling({
    paymentId: paymentIntent?.paymentId || null,
    enabled: !!paymentIntent,
    autoStart: true, // Auto-start when paymentId available
    interval: 3000, // Poll every 3 seconds (safe for SePay rate limit)
    maxAttempts: 60, // 3 minutes total (60 × 3s = 180s)
    onSuccess: () => {
      log('data', '[sepay] Payment confirmed via polling', {
        paymentId: paymentIntent?.paymentId ? maskId(paymentIntent.paymentId) : null,
      }, { feature: 'payment' })
      setStatus('success')
      if (countdownRef.current) clearInterval(countdownRef.current)
    },
    onTimeout: () => {
      log('data', '[sepay] Payment polling timeout', {
        paymentId: paymentIntent?.paymentId ? maskId(paymentIntent.paymentId) : null,
      }, { feature: 'payment' })
      setStatus('expired')
      setError('Payment verification timed out. Please check your bank app or try again.')
      if (countdownRef.current) clearInterval(countdownRef.current)
    },
    onError: (err) => {
      logError('data', '[sepay] Payment polling error', err, { feature: 'payment' })
      setStatus('failed')
      setError(err.message || 'Payment verification failed')
      if (countdownRef.current) clearInterval(countdownRef.current)
    },
  })

  // Sync polling status to component status
  useEffect(() => {
    if (pollingStatus === 'polling' && status === 'waiting') {
      setStatus('processing')
    }
  }, [pollingStatus, status])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [stopPolling])

  // Start countdown timer
  const startCountdown = useCallback((expiresAt: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        setStatus('expired')
        stopPolling()
        if (countdownRef.current) clearInterval(countdownRef.current)
      }
    }
    
    updateRemaining()
    countdownRef.current = setInterval(updateRemaining, 1000)
  }, [stopPolling])

  // Create payment intent and start polling
  const createPaymentIntent = useCallback(async () => {
    if (!orderId) {
      setError('No order ID provided')
      setStatus('failed')
      return
    }
    
    setStatus('loading')
    setError(null)
    resetPolling()
    
    try {
      log('data', 'Creating SePay payment intent', {
        orderId: maskId(orderId),
      }, { feature: 'payment' })
      
      const intent = await checkoutApi.createPaymentIntent({
        orderId,
        returnUrl: `${window.location.origin}/orders/${orderId}`,
        cancelUrl: `${window.location.origin}/checkout`,
      })
      
      setPaymentIntent(intent)
      setStatus('waiting')
      
      // Start countdown based on expiresAt
      startCountdown(intent.expiresAt)
      
      log('data', 'SePay payment intent created', {
        paymentId: maskId(intent.paymentId),
        amount: intent.amount,
        expiresAt: intent.expiresAt,
      }, { feature: 'payment' })
      
      // Polling will auto-start via usePaymentPolling hook when paymentId becomes available
      
    } catch (err) {
      logError('data', 'Failed to create payment intent', err, { feature: 'payment' })
      setError(err instanceof Error ? err.message : 'Failed to create payment')
      setStatus('failed')
    }
  }, [orderId, startCountdown, resetPolling, startPolling])

  // Auto-create payment intent on mount
  useEffect(() => {
    if (orderId && status === 'loading' && !paymentIntent) {
      createPaymentIntent()
    }
  }, [orderId, status, paymentIntent, createPaymentIntent])

  // Retry payment
  const retryPayment = useCallback(() => {
    stopPolling()
    resetPolling()
    if (countdownRef.current) clearInterval(countdownRef.current)
    
    setPaymentIntent(null)
    setError(null)
    setStatus('loading')
    
    // Small delay then recreate
    setTimeout(() => createPaymentIntent(), 100)
  }, [createPaymentIntent, stopPolling, resetPolling])

  // Navigate to order tracking
  const goToOrderTracking = useCallback(() => {
    if (orderId) {
      router.push(`/orders/${orderId}`)
    }
  }, [orderId, router])

  // Go back
  const goBack = useCallback(() => {
    stopPolling()
    router.back()
  }, [router, stopPolling])

  return {
    status,
    error,
    paymentIntent,
    timeRemaining,
    pollingProgress,
    pollingAttempt,
    pollingMaxAttempts,
    createPaymentIntent,
    retryPayment,
    goToOrderTracking,
    goBack,
  }
}
