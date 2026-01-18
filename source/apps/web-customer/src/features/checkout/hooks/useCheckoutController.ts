import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/shared/hooks/useCart'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { SERVICE_CHARGE_RATE, type CheckoutFormData, type CheckoutState } from '../model'
import { useSession } from '@/features/tables/hooks'
import { useCheckoutStore, type PaymentMethod, type TipPercent } from '@/stores/checkout.store'
import { useOrderStore } from '@/stores/order.store'
import { checkoutApi } from '../data'
import type { CheckoutRequest } from '../data'
// Note: useMergeableOrder removed - each checkout now creates a new order
// Multiple orders will be consolidated into a Bill when table is closed

export function useCheckoutController() {
  const router = useRouter()
  const { 
    items: cartItems, 
    subtotal, 
    tax, 
    serviceCharge, 
    total,
    isLoading: isCartLoading,
    clearCart 
  } = useCart()
  const { session } = useSession()
  
  // Use Zustand store for checkout form state
  const customerName = useCheckoutStore((state) => state.customerName)
  const notes = useCheckoutStore((state) => state.notes)
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod)
  const tipPercent = useCheckoutStore((state) => state.tipPercent)
  const customTipAmount = useCheckoutStore((state) => state.customTipAmount)
  const setCustomerName = useCheckoutStore((state) => state.setCustomerName)
  const setNotes = useCheckoutStore((state) => state.setNotes)
  const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod)
  const setTipPercent = useCheckoutStore((state) => state.setTipPercent)
  const setCustomTipAmount = useCheckoutStore((state) => state.setCustomTipAmount)
  const resetCheckout = useCheckoutStore((state) => state.reset)
  
  // Use order store for active order tracking
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder)
  const setPaymentStatus = useOrderStore((state) => state.setPaymentStatus)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate tip amount (percentage or custom dollar amount)
  const tipAmount = useMemo(() => {
    if (tipPercent === 'custom') {
      return customTipAmount
    }
    return subtotal * (tipPercent as number)
  }, [subtotal, tipPercent, customTipAmount])
  
  // Final total with tip
  const finalTotal = useMemo(() => total + tipAmount, [total, tipAmount])

  const formData: CheckoutFormData = {
    name: customerName,
    notes,
    paymentMethod: paymentMethod as any, // Type conversion for model compatibility
  }

  const state: CheckoutState = useMemo(
    () => ({
      ...formData,
    }),
    [formData]
  )

  const updateField = (field: keyof CheckoutFormData | 'tipPercent' | 'customTipAmount', value: any) => {
    if (field === 'name') {
      setCustomerName(value)
    } else if (field === 'notes') {
      setNotes(value)
    } else if (field === 'paymentMethod') {
      // Map old values to new enum
      const methodMap: Record<string, PaymentMethod> = {
        'card': 'SEPAY_QR',
        'counter': 'BILL_TO_TABLE',
        'SEPAY_QR': 'SEPAY_QR',
        'BILL_TO_TABLE': 'BILL_TO_TABLE',
      }
      setPaymentMethod(methodMap[value] || 'BILL_TO_TABLE')
    } else if (field === 'tipPercent') {
      setTipPercent(value as TipPercent)
    } else if (field === 'customTipAmount') {
      setCustomTipAmount(value as number)
    }
  }

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }

    const startTime = Date.now()
    setIsSubmitting(true)
    setError(null)

    try {
      log('data', 'Checkout started', { 
        itemCount: cartItems.length, 
        paymentMethod,
        tipPercent: tipPercent === 'custom' ? 'custom' : tipPercent * 100 + '%',
        tipAmount: tipAmount.toFixed(2),
        // Note: Auto-merge disabled - each checkout creates new order
        // Orders will be consolidated into Bill when table is closed
      }, { feature: 'checkout' });

      let order: any;

      // IMPORTANT: Always create NEW order for each checkout
      // This ensures each order goes through proper flow:
      // PENDING → Waiter confirm → RECEIVED → KDS → PREPARING → READY → SERVED
      // 
      // Multiple orders from same session will be consolidated into 
      // a single Bill when the table is closed (BILL_TO_TABLE payment)
      // 
      // Why not merge into existing order?
      // - New items must go through waiter confirmation (PENDING state)
      // - KDS needs to see NEW orders in "New" column, not mixed with existing
      // - Clear audit trail: each order = one batch of items
      const checkoutRequest: CheckoutRequest = {
        customerName: customerName || undefined,
        customerNotes: notes || undefined,
        paymentMethod,
        // Note: Tip handling removed - backend calculates from cart totals
      }

      order = await checkoutApi.checkout(checkoutRequest)

      log('data', 'New order created', { 
        orderId: maskId(order.id),
        orderNumber: order.orderNumber,
        paymentMethod,
        durationMs: Date.now() - startTime,
      }, { feature: 'checkout' });

      // 2. Set active order in store
      setActiveOrder(order.id, 'checkout')
      setPaymentStatus('PENDING', order.id)

      // 3. Clear cart (server cart already cleared by backend)
      await clearCart()
      
      log('ui', 'Cart cleared after order', { 
        orderId: maskId(order.id),
      }, { feature: 'checkout' });

      // 4. Reset checkout form
      resetCheckout()

      // 5. Navigate based on payment method
      if (paymentMethod === 'SEPAY_QR') {
        // Go to payment page to show QR with payment method parameter
        router.push(`/payment?orderId=${order.id}&paymentMethod=${paymentMethod}`)
      } else {
        // BILL_TO_TABLE - go directly to order tracking
        router.push(`/orders/${order.id}`)
      }

    } catch (err) {
      logError('data', 'Checkout failed', err, { feature: 'checkout' });
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.')
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

    // Cart info (from server)
    cartItems,
    subtotal,
    tax,
    serviceCharge,
    tipAmount,
    tipPercent,
    total: finalTotal, // Include tip in total
    isCartLoading,

    // Table info
    tableNumber: session?.tableNumber || 'Unknown',

    // Actions
    handleSubmit,
    handleBack,
  }
}

