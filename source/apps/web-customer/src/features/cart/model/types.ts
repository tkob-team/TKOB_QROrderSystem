/**
 * Cart Feature - Type Definitions
 */

export type Currency = 'USD' | 'VND'

export type CartTotals = {
  subtotal: number
  tax: number
  serviceCharge: number
  total: number
}
