'use client'

import { useCartStore } from '@/stores/cart.store'
import { useMemo } from 'react'

export function useCart() {
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
  } = useCartStore()

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      // Get base price from menuItem
      let itemPrice = item.menuItem.basePrice

      // Add size price if selected
      if (item.selectedSize && item.menuItem.sizes) {
        const sizeOption = item.menuItem.sizes.find(s => s.size === item.selectedSize)
        if (sizeOption) {
          itemPrice = sizeOption.price
        }
      }

      // Add toppings price
      if (item.selectedToppings.length > 0 && item.menuItem.toppings) {
        const toppingsPrice = item.selectedToppings.reduce((tSum: number, toppingId: string) => {
          const topping = item.menuItem.toppings?.find(t => t.id === toppingId)
          return tSum + (topping?.price || 0)
        }, 0)
        itemPrice += toppingsPrice
      }

      const itemTotal = itemPrice * item.quantity
      return sum + itemTotal
    }, 0)

    const tax = subtotal * 0.1 // 10% tax
    const serviceCharge = subtotal * 0.05 // 5% service charge
    const total = subtotal + tax + serviceCharge

    return {
      subtotal,
      tax,
      serviceCharge,
      total,
    }
  }, [items])

  const itemCount = useMemo(() => {
    return getItemCount()
  }, [items, getItemCount])

  return {
    items,
    itemCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    ...totals,
  }
}
