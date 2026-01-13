import { useMemo } from 'react'
import { useCart } from '@/shared/hooks/useCart'
import { TAX_RATE, SERVICE_CHARGE_RATE, type CartTotals } from '../model'

export function useCartController() {
  const { items, updateQuantity, removeItem, clearCart } = useCart()

  const subtotal = useMemo(() => {
    return items.reduce((sum, cartItem) => {
      let itemPrice = cartItem.menuItem.basePrice

      if (cartItem.selectedSize && cartItem.menuItem.sizes) {
        const size = cartItem.menuItem.sizes.find((s) => s.size === cartItem.selectedSize)
        if (size) itemPrice = size.price
      }

      if (cartItem.menuItem.toppings) {
        cartItem.selectedToppings.forEach((toppingId) => {
          const topping = cartItem.menuItem.toppings!.find((t) => t.id === toppingId)
          if (topping) itemPrice += topping.price
        })
      }

      return sum + itemPrice * cartItem.quantity
    }, 0)
  }, [items])

  const totals: CartTotals = useMemo(() => {
    const tax = subtotal * TAX_RATE
    const serviceCharge = subtotal * SERVICE_CHARGE_RATE
    const total = subtotal + tax + serviceCharge
    return { subtotal, tax, serviceCharge, total }
  }, [subtotal])

  return {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totals,
  }
}
