import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useCart } from '@/shared/hooks/useCart'
import { log, logError } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'
import { type CheckoutFormData, type CheckoutState } from '../model'
import { useSession } from '@/features/tables/hooks'
import { useCheckoutStore, type TipPercent } from '@/stores/checkout.store'
import { useOrderStore } from '@/stores/order.store'
import { checkoutApi } from '../data'
import type { CheckoutRequest } from '../data'
// Note: useMergeableOrder removed - each checkout now creates a new order
// Multiple orders will be consolidated via Request Bill flow

export function useCheckoutController() {
  const router = useRouter()
  const queryClient = useQueryClient()
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
  const tipPercent = useCheckoutStore((state) => state.tipPercent)
  const customTipAmount = useCheckoutStore((state) => state.customTipAmount)
  // FEAT-14: Discount fields from store
  const discountCode = useCheckoutStore((state) => state.discountCode)
  const discountApplied = useCheckoutStore((state) => state.discountApplied)
  const discountAmount = useCheckoutStore((state) => state.discountAmount)
  
  const setCustomerName = useCheckoutStore((state) => state.setCustomerName)
  const setNotes = useCheckoutStore((state) => state.setNotes)
  const setTipPercent = useCheckoutStore((state) => state.setTipPercent)
  const setCustomTipAmount = useCheckoutStore((state) => state.setCustomTipAmount)
  // FEAT-14: Discount setters from store
  const setDiscountCode = useCheckoutStore((state) => state.setDiscountCode)
  const setDiscountApplied = useCheckoutStore((state) => state.setDiscountApplied)
  const setDiscountAmount = useCheckoutStore((state) => state.setDiscountAmount)
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
  
  // Final total with tip and discount applied
  const finalTotal = useMemo(() => {
    const baseTotal = total + tipAmount
    return discountApplied && discountAmount > 0 
      ? Math.max(0, baseTotal - discountAmount) // Ensure total doesn't go negative
      : baseTotal
  }, [total, tipAmount, discountApplied, discountAmount])

  const formData: CheckoutFormData = {
    name: customerName,
    notes,
    // paymentMethod always defaults to BILL_TO_TABLE (handled by backend)
    // FEAT-14: Discount fields
    discountCode,
    discountApplied,
    discountAmount,
  }

  const state: CheckoutState = useMemo(
    () => ({
      ...formData,
    }),
    [customerName, notes, discountCode, discountApplied, discountAmount]
  )

  const updateField = (field: keyof CheckoutFormData | 'tipPercent' | 'customTipAmount' | 'promotionId', value: any) => {
    if (field === 'name') {
      setCustomerName(value)
    } else if (field === 'notes') {
      setNotes(value)
    } else if (field === 'tipPercent') {
      setTipPercent(value as TipPercent)
    } else if (field === 'customTipAmount') {
      setCustomTipAmount(value as number)
    } else if (field === 'discountCode') {
      setDiscountCode(value as string)
    } else if (field === 'discountApplied') {
      setDiscountApplied(value as boolean)
    } else if (field === 'discountAmount') {
      setDiscountAmount(value as number)
    } else if (field === 'promotionId') {
      // promotionId is handled by discount fields, no separate store field needed
      log('ui', 'Promotion ID set', { promotionId: value }, { feature: 'checkout' })
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
        tipPercent: tipPercent === 'custom' ? 'custom' : tipPercent * 100 + '%',
        tipAmount: tipAmount.toFixed(2),
        // Payment method always BILL_TO_TABLE (order now, pay later via Request Bill)
      }, { feature: 'checkout' });

      let order: any;

      // IMPORTANT: Always create NEW order for each checkout
      // This ensures each order goes through proper flow:
      // PENDING → Waiter confirm → RECEIVED → KDS → PREPARING → READY → SERVED
      // 
      // Multiple orders from same session will be consolidated when
      // customer uses "Request Bill" feature (pay once for all orders)
      // 
      // Why not merge into existing order?
      // - New items must go through waiter confirmation (PENDING state)
      // - KDS needs to see NEW orders in "New" column, not mixed with existing
      // - Clear audit trail: each order = one batch of items
      const checkoutRequest: CheckoutRequest = {
        customerName: customerName || undefined,
        customerNotes: notes || undefined,
        // paymentMethod omitted - backend defaults to BILL_TO_TABLE
      }

      order = await checkoutApi.checkout(checkoutRequest)

      log('data', 'New order created', { 
        orderId: maskId(order.id),
        orderNumber: order.orderNumber,
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

      // 5. Invalidate orders cache (BUG-07 fix)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['table-orders'] })
      
      // 6. Navigate to orders list after successful checkout
      // Customer can order more, then use "Request Bill" when ready to pay
      router.replace('/orders')

    } catch (err) {
      logError('data', 'Checkout failed', err, { feature: 'checkout' });
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    // Navigate to menu instead of router.back() to avoid going back to order detail
    router.push('/menu')
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

