'use client'

import { useCartStore } from '@/stores/cart.store'
import { useEffect } from 'react'

/**
 * Cart hook - provides cart data and actions
 * 
 * Now fetches cart from server on mount (syncs with backend)
 * All calculations (subtotal, tax, serviceCharge, total) come from server
 */
export function useCart() {
  const {
    items,
    subtotal,
    tax,
    taxRate,
    serviceCharge,
    serviceChargeRate,
    total,
    itemCount,
    isLoading,
    isInitialized,
    error,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    resetError,
  } = useCartStore()

  // Fetch cart from server on mount
  useEffect(() => {
    if (!isInitialized) {
      fetchCart()
    }
  }, [isInitialized, fetchCart])

  return {
    // Cart data (from server)
    items,
    itemCount,
    subtotal,
    tax,
    taxRate,
    serviceCharge,
    serviceChargeRate,
    total,
    
    // UI state
    isLoading,
    isInitialized,
    error,
    
    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    resetError,
    refetch: fetchCart,
  }
}
