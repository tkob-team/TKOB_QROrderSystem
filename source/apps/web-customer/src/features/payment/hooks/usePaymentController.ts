"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/types'
import type { PaymentController, PaymentStatus } from '../model'

interface UsePaymentControllerProps {
  total: number
  itemCount: number
  existingOrder?: Order | null
  onPaymentSuccess?: () => void
  onPaymentFailure?: () => void
}

export function usePaymentController({
  total,
  itemCount,
  existingOrder,
  onPaymentSuccess,
  onPaymentFailure,
}: UsePaymentControllerProps): PaymentController {
  const router = useRouter()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('waiting')
  const [error, setError] = useState<string | null>(null)

  // Auto-simulate payment success after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate random success/failure for demo
      const success = Math.random() > 0.2

      if (success) {
        setPaymentStatus('success')
      } else {
        setPaymentStatus('failed')
        setError('Payment timed out. Please try again or choose a different payment option.')
        if (onPaymentFailure) {
          onPaymentFailure()
        }
      }
    }, 5000) // 5 seconds

    return () => clearTimeout(timer)
  }, [onPaymentFailure])

  const state = useMemo(
    () => ({
      paymentStatus,
      error,
      total,
      itemCount,
      existingOrder,
    }),
    [paymentStatus, error, total, itemCount, existingOrder]
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
    setPaymentStatus('waiting')
    setError(null)
  }

  return {
    state,
    actions: {
      goBack,
      handlePaymentSuccess,
      handlePaymentFailure,
      handleViewOrderStatus,
      retryPayment,
    },
  }
}
