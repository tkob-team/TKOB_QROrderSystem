import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCart } from '@/shared/hooks/useCart'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { useCheckoutStore } from '@/stores/checkout.store'
import { useOrderStore } from '@/stores/order.store'
import { useSession } from '@/features/tables/hooks'
import { checkoutApi, type CheckoutRequest } from '@/features/checkout/data'

/**
 * Hook for handling checkout directly from cart page
 * Simplified flow: Place order → Navigate to Orders page
 * Tips and vouchers moved to Request Bill flow
 */
export function useCartCheckout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { items: cartItems, clearCart } = useCart()
  const { session } = useSession()
  
  // Check if bill has been requested (session is locked)
  const isBillRequested = session?.billRequestedAt != null
  
  // Form state from checkout store
  const customerName = useCheckoutStore((state) => state.customerName)
  const notes = useCheckoutStore((state) => state.notes)
  const setCustomerName = useCheckoutStore((state) => state.setCustomerName)
  const setNotes = useCheckoutStore((state) => state.setNotes)
  const resetCheckout = useCheckoutStore((state) => state.reset)
  
  // Order tracking
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)
  const setPaymentStatus = useOrderStore((state) => state.setPaymentStatus)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlaceOrder = async () => {
    // Check if bill has been requested
    if (isBillRequested) {
      toast.error('Session Locked', {
        description: 'Bill has been requested. Cancel the bill request to add more orders.',
      })
      return
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    const startTime = Date.now()
    setIsSubmitting(true)
    setError(null)

    try {
      log('data', 'Placing order from cart', { 
        itemCount: cartItems.length,
        hasCustomerName: !!customerName,
        hasNotes: !!notes,
      }, { feature: 'cart-checkout' })

      // Create order (always BILL_TO_TABLE payment method)
      const checkoutRequest: CheckoutRequest = {
        customerName: customerName || undefined,
        customerNotes: notes || undefined,
      }

      const order = await checkoutApi.checkout(checkoutRequest)

      log('data', 'Order created from cart', { 
        orderId: maskId(order.id),
        orderNumber: order.orderNumber,
        durationMs: Date.now() - startTime,
      }, { feature: 'cart-checkout' })

      // Track order
      setActiveOrder(order.id, 'cart-checkout')
      setPaymentStatus('PENDING', order.id)

      // Clear cart
      await clearCart()

      // Reset checkout form state
      resetCheckout()

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['table-orders'] })

      // Show success toast
      toast.success('Order placed!', {
        description: 'Track your order on the Orders page',
      })

      // Navigate to orders page
      router.replace('/orders')

    } catch (err) {
      logError('data', 'Failed to place order from cart', err, { feature: 'cart-checkout' })
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    customerName,
    notes,
    setCustomerName,
    setNotes,
    handlePlaceOrder,
    isSubmitting,
    error,
    isBillRequested,
  }
}
