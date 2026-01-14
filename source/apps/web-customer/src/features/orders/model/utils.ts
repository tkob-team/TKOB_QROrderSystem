/**
 * Orders Feature - Utility Functions
 */

import type { Order as ApiOrder } from '@/types/order'
import type { Order, OrderItem } from './types'
import type { CartItem } from '@/types/cart'
import { log } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'

/**
 * Convert CartItem to OrderItem for order display
 */
function cartItemToOrderItem(cartItem: CartItem | any): OrderItem {
  // CartItem structure: { id, menuItem: MenuItem, selectedSize?, selectedToppings[], quantity, ... }
  // OrderItem structure: { id, name, quantity, size?, toppings?, specialInstructions?, price }
  
  const itemName = (cartItem.menuItem?.name || cartItem.name || 'Unknown Item') as string
  const itemId = cartItem.id || `item-${Math.random().toString(36).slice(2, 9)}`
  
  // Try to calculate line total (base price + size + toppings) * quantity
  let linePrice = 0
  if (cartItem.menuItem?.basePrice) {
    linePrice = cartItem.menuItem.basePrice
    
    // Add size price if applicable
    if (cartItem.selectedSize && cartItem.menuItem.sizes) {
      const selectedSizeObj = cartItem.menuItem.sizes.find((s: any) => s.size === cartItem.selectedSize)
      if (selectedSizeObj?.price) {
        linePrice = selectedSizeObj.price
      }
    }
    
    // Add topping prices
    if (cartItem.selectedToppings && cartItem.menuItem.toppings) {
      const toppingCost = cartItem.selectedToppings.reduce((sum: number, toppingId: string) => {
        const topping = cartItem.menuItem.toppings.find((t: any) => t.id === toppingId)
        return sum + (topping?.price || 0)
      }, 0)
      linePrice += toppingCost
    }
    
    linePrice *= cartItem.quantity || 1
  }
  
  const result: OrderItem = {
    id: itemId,
    name: itemName,
    quantity: cartItem.quantity || 1,
    size: cartItem.selectedSize,
    toppings: cartItem.selectedToppings || [],
    specialInstructions: cartItem.specialInstructions,
    price: linePrice,
  }
  
  if (process.env.NEXT_PUBLIC_USE_LOGGING) {
    log('data', 'Mapped CartItem to OrderItem', { itemName: result.name, qty: result.quantity, price: result.price }, { feature: 'orders' })
  }
  
  return result
}

/**
 * Map API order shape to feature model shape
 */
export function toFeatureOrder(api: ApiOrder): Order {
  const mappedItems = (api.items || []).map(item => cartItemToOrderItem(item))
  
  if (process.env.NEXT_PUBLIC_USE_LOGGING) {
    log('data', 'Converting API Order to Feature Order', { orderId: maskId(api.id), itemsCount: mappedItems.length }, { feature: 'orders' })
  }
  
  return {
    id: api.id,
    tableNumber: api.tableNumber ? parseInt(String(api.tableNumber), 10) : undefined,
    status: 'Received',
    paymentStatus: (api.paymentStatus as any) === 'Paid' ? 'Paid' : 'Unpaid',
    paymentMethod: api.paymentMethod as any,
    items: mappedItems,
    notes: api.notes || '',
    subtotal: api.subtotal,
    tax: api.tax,
    serviceCharge: api.serviceCharge,
    total: api.total,
    createdAt: typeof api.createdAt === 'string' ? api.createdAt : (api.createdAt as any).toISOString?.() || String(api.createdAt),
    updatedAt: typeof api.createdAt === 'string' ? api.createdAt : (api.createdAt as any).toISOString?.() || String(api.createdAt),
  }
}
