import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { mockTable } from '@/lib/mockData'
import { SERVICE_CHARGE_RATE, type CheckoutFormData, type CheckoutState } from '../model'

export function useCheckoutController() {
  const router = useRouter()
  const { items: cartItems } = useCart()
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    notes: '',
    paymentMethod: 'counter',
  })

  // TODO: Replace with actual cart totals from cart context or passed props
  // For now, calculate minimal totals
  const subtotal = 0 // In real app, get from cart
  const tax = subtotal * 0.1
  const serviceCharge = subtotal * SERVICE_CHARGE_RATE
  const total = subtotal + tax + serviceCharge

  const state: CheckoutState = useMemo(
    () => ({
      ...formData,
    }),
    [formData]
  )

  const updateField = (field: keyof CheckoutFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    // Route based on payment method (no API call yet)
    if (formData.paymentMethod === 'card') {
      router.push('/payment/qr')
    } else {
      router.push('/payment/success')
    }
  }

  const handleBack = () => {
    router.back()
  }

  return {
    // Form state
    state,
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
