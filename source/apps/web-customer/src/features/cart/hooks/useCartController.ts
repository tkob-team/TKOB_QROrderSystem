import { useMemo } from 'react'
import { useCart } from '@/shared/hooks/useCart'
import { type CartTotals } from '../model'

export interface CartTotalsWithRates extends CartTotals {
  taxRate: number;
  serviceChargeRate: number;
}

export function useCartController() {
  const { items, subtotal, tax, taxRate, serviceCharge, serviceChargeRate, total, updateQuantity, removeItem, clearCart } = useCart()

  // Totals now come from server, no need to recalculate
  const totals: CartTotalsWithRates = useMemo(() => {
    return { subtotal, tax, taxRate, serviceCharge, serviceChargeRate, total }
  }, [subtotal, tax, taxRate, serviceCharge, serviceChargeRate, total])

  return {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totals,
  }
}
