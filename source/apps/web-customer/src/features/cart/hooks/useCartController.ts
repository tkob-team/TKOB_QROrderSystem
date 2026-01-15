import { useMemo } from 'react'
import { useCart } from '@/shared/hooks/useCart'
import { type CartTotals } from '../model'

export function useCartController() {
  const { items, subtotal, tax, serviceCharge, total, updateQuantity, removeItem, clearCart } = useCart()

  // Totals now come from server, no need to recalculate
  const totals: CartTotals = useMemo(() => {
    return { subtotal, tax, serviceCharge, total }
  }, [subtotal, tax, serviceCharge, total])

  return {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totals,
  }
}
