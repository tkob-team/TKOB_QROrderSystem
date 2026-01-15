// SePay Payment Controller - handles VietQR payment flow

"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { checkoutApi } from '@/features/checkout/data'
import type { PaymentIntentResponse, PaymentStatusResponse } from '@/features/checkout/data'

export type SepayPaymentStatus = 
  | 'loading'      // Creating payment intent
  | 'waiting'      // QR displayed, waiting for payment
  | 'processing'   // Payment being verified
  | 'success'      // Payment completed
  | 'failed'       // Payment failed
  | 'expired'      // Payment expired

interface UseSepayPaymentResult {
  // State
  status: SepayPaymentStatus
  error: string | null
  paymentIntent: PaymentIntentResponse | null
  timeRemaining: number // seconds until expiry
  
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
  
  const pollingRef = useRef<boolean>(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pollingRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // Start countdown timer
  const startCountdown = useCallback((expiresAt: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        setStatus('expired')
        pollingRef.current = false
        if (countdownRef.current) clearInterval(countdownRef.current)
      }
    }
    
    updateRemaining()
    countdownRef.current = setInterval(updateRemaining, 1000)
  }, [])

  // Poll payment status
  const pollPaymentStatus = useCallback(async (paymentId: string) => {
    if (!pollingRef.current) return
    
    try {
      const statusResponse = await checkoutApi.getPaymentStatus(paymentId)
      
      log('data', 'Payment status polled', {
        paymentId: maskId(paymentId),
        status: statusResponse.status,
      }, { feature: 'payment' })
      
      switch (statusResponse.status) {
        case 'COMPLETED':
          setStatus('success')
          pollingRef.current = false
          if (countdownRef.current) clearInterval(countdownRef.current)
          break
          
        case 'FAILED':
          setStatus('failed')
          setError(statusResponse.failureReason || 'Payment failed')
          pollingRef.current = false
          break
          
        case 'PROCESSING':
          setStatus('processing')
          // Continue polling
          if (pollingRef.current) {
            timerRef.current = setTimeout(() => pollPaymentStatus(paymentId), 3000)
          }
          break
          
        case 'PENDING':
        default:
          // Continue polling
          if (pollingRef.current) {
            timerRef.current = setTimeout(() => pollPaymentStatus(paymentId), 3000)
          }
          break
      }
    } catch (err) {
      logError('data', 'Payment status poll failed', err, { feature: 'payment' })
      // Don't stop polling on transient errors
      if (pollingRef.current) {
        timerRef.current = setTimeout(() => pollPaymentStatus(paymentId), 5000)
      }
    }
  }, [])

  // Create payment intent and start polling
  const createPaymentIntent = useCallback(async () => {
    if (!orderId) {
      setError('No order ID provided')
      setStatus('failed')
      return
    }
    
    setStatus('loading')
    setError(null)
    
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
      
      // Start countdown
      startCountdown(intent.expiresAt)
      
      // Start polling for payment status
      pollingRef.current = true
      timerRef.current = setTimeout(() => pollPaymentStatus(intent.paymentId), 3000)
      
      log('data', 'SePay payment intent created', {
        paymentId: maskId(intent.paymentId),
        amount: intent.amount,
        expiresAt: intent.expiresAt,
      }, { feature: 'payment' })
      
    } catch (err) {
      logError('data', 'Failed to create payment intent', err, { feature: 'payment' })
      setError(err instanceof Error ? err.message : 'Failed to create payment')
      setStatus('failed')
    }
  }, [orderId, startCountdown, pollPaymentStatus])

  // Auto-create payment intent on mount
  useEffect(() => {
    if (orderId && status === 'loading' && !paymentIntent) {
      createPaymentIntent()
    }
  }, [orderId, status, paymentIntent, createPaymentIntent])

  // Retry payment
  const retryPayment = useCallback(() => {
    pollingRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    
    setPaymentIntent(null)
    setError(null)
    setStatus('loading')
    
    // Small delay then recreate
    setTimeout(() => createPaymentIntent(), 100)
  }, [createPaymentIntent])

  // Navigate to order tracking
  const goToOrderTracking = useCallback(() => {
    if (orderId) {
      router.push(`/orders/${orderId}`)
    }
  }, [orderId, router])

  // Go back
  const goBack = useCallback(() => {
    pollingRef.current = false
    router.back()
  }, [router])

  return {
    status,
    error,
    paymentIntent,
    timeRemaining,
    createPaymentIntent,
    retryPayment,
    goToOrderTracking,
    goBack,
  }
}
