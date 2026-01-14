import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/shared/hooks/useCart'
import { mockTable } from '@/lib/mockData'
import { debugLog, debugError } from '@/lib/debug'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { SERVICE_CHARGE_RATE, type CheckoutFormData, type CheckoutState } from '../model'
import { OrdersDataFactory } from '@/features/orders/data'
import { useSession } from '@/features/tables/hooks'
import { useCheckoutStore } from '@/stores/checkout.store'
import { useOrderStore } from '@/stores/order.store'

export function useCheckoutController() {
  const router = useRouter()
  const { items: cartItems, subtotal, tax, serviceCharge, total, clearCart } = useCart()
  const { session } = useSession()
  
  // Use Zustand store for checkout form state
  const customerName = useCheckoutStore((state) => state.customerName)
  const notes = useCheckoutStore((state) => state.notes)
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod)
  const setCustomerName = useCheckoutStore((state) => state.setCustomerName)
  const setNotes = useCheckoutStore((state) => state.setNotes)
  const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod)
  const resetCheckout = useCheckoutStore((state) => state.reset)
  
  // Use order store for active order tracking
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)
  const setPaymentStatus = useOrderStore((state) => state.setPaymentStatus)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formData: CheckoutFormData = {
    name: customerName,
    notes,
    paymentMethod,
  }

  const state: CheckoutState = useMemo(
    () => ({
      ...formData,
    }),
    [formData]
  )

  const updateField = (field: keyof CheckoutFormData, value: any) => {
    if (field === 'name') {
      setCustomerName(value)
    } else if (field === 'notes') {
      setNotes(value)
    } else if (field === 'paymentMethod') {
      setPaymentMethod(value)
    }
  }

  const handleSubmit = async () => {
    const startTime = Date.now()
    setIsSubmitting(true)
    setError(null)

    try {
      const tableId = session?.tableId ?? (mockTable as any)?.id ?? 'table-001'

      debugLog('Checkout', 'place_order', {
        itemCount: cartItems.length,
        total,
        paymentMethod: paymentMethod,
      })

      log('data', 'Order creation attempt', { itemCount: cartItems.length, paymentMethod: paymentMethod, tableId: maskId(tableId) }, { feature: 'checkout', dedupe: true, dedupeTtlMs: 5000 });

      const strategy = OrdersDataFactory.getStrategy()
      const response = await strategy.createOrder({
        tableId,
        items: cartItems,
        customerName: customerName,
        notes: notes,
        paymentMethod: paymentMethod,
      })

      if (!response.success || !response.data) {
        setError(response.message || 'Failed to create order')
        setIsSubmitting(false)
        return
      }

      const orderId = response.data.id

      log('data', 'Order created', { orderId: maskId(orderId), paymentMethod: paymentMethod, durationMs: Date.now() - startTime }, { feature: 'checkout' });

      // Set active order in store for session tracking
      setActiveOrder(orderId, 'checkout')
      
      // Set initial payment status based on payment method
      if (paymentMethod === 'card') {
        setPaymentStatus('PENDING', orderId)
      } else {
        setPaymentStatus('PENDING', orderId) // Counter payment pending (pay at counter/table)
      }

      // Clear cart immediately after successful order creation
      // This applies to both card and counter payments
      clearCart()
      
      log('ui', 'Cart cleared', { afterOrderId: maskId(orderId), paymentMethod: paymentMethod }, { feature: 'checkout' });

      // Reset checkout form after successful order
      resetCheckout()

      if (paymentMethod === 'card') {
        router.push(`/payment?orderId=${orderId}`)
      } else {
        router.push(`/payment/success?orderId=${orderId}`)
      }
    } catch (err) {
      debugError('Checkout', 'place_order_error', err)
      logError('data', 'Order creation error', err, { feature: 'checkout' });
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return {
    // Form state
    state: { ...state, isSubmitting, error },
    updateField,

    // Cart info
    cartItems,
    mockTable,
    subtotal,
    tax,
    serviceCharge,
    total,

    // Actions
    handleSubmit,
    handleBack,
  }
}
