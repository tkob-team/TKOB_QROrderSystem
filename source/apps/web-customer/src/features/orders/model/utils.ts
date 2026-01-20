/**
 * Orders Feature - Utility Functions
 */

import type { Order as ApiOrder } from '@/types/order'
import type { Order, OrderItem } from './types'
import type { CartItem } from '@/types/cart'
import { log } from '@/shared/logging/logger'
import { maskId } from '@/shared/logging/helpers'

/**
 * Convert CartItem or API OrderItem to OrderItem for order display
 * Handles both:
 * - CartItem format: { menuItem: MenuItem, quantity, selectedSize, ... }
 * - API OrderItemResponseDto format: { id, name, price, quantity, itemTotal, modifiers, ... }
 */
function cartItemToOrderItem(cartItem: CartItem | any): OrderItem {
  const itemId = cartItem.id || `item-${Math.random().toString(36).slice(2, 9)}`
  
  // API response format: has name directly (OrderItemResponseDto)
  // CartItem format: name is in cartItem.menuItem.name
  const itemName = cartItem.name || cartItem.menuItem?.name || 'Unknown Item'
  
  // API response format: has price/itemTotal directly
  // CartItem format: need to calculate from menuItem.basePrice
  let linePrice = 0
  
  // Check API response format first (has itemTotal or direct price)
  if (typeof cartItem.itemTotal === 'number' && cartItem.itemTotal > 0) {
    linePrice = cartItem.itemTotal
  } else if (typeof cartItem.price === 'number' && cartItem.price > 0) {
    // For API format with single price (unit price) - multiply by quantity
    linePrice = cartItem.price * (cartItem.quantity || 1)
  } else if (cartItem.menuItem?.basePrice) {
    // Fallback: CartItem format - calculate from menuItem
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
  
  // Extract size from modifiers for API format
  const size = cartItem.selectedSize || 
    (cartItem.modifiers?.find((m: any) => m.type === 'size')?.name) ||
    undefined
  
  // Extract toppings from modifiers for API format  
  const toppings = cartItem.selectedToppings || 
    (cartItem.modifiers?.filter((m: any) => m.type === 'topping')?.map((m: any) => m.name)) ||
    []
  
  const result: OrderItem = {
    id: itemId,
    name: itemName,
    quantity: cartItem.quantity || 1,
    size,
    toppings,
    specialInstructions: cartItem.specialInstructions || cartItem.notes,
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
    log('data', 'Converting API Order to Feature Order', { orderId: maskId(api.id), itemsCount: mappedItems.length, tip: api.tip }, { feature: 'orders' })
  }
  
  // Map API status (uppercase) to Feature status
  // API uses: PENDING, RECEIVED, PREPARING, READY, SERVED, COMPLETED, CANCELLED
  const apiStatus = (api.status as string)?.toUpperCase() || 'RECEIVED'
  
  return {
    id: api.id,
    tableNumber: api.tableNumber ? parseInt(String(api.tableNumber), 10) : undefined,
    status: apiStatus as Order['status'],
    paymentStatus: (api.paymentStatus as any) === 'Paid' ? 'Paid' : 'Unpaid',
    paymentMethod: api.paymentMethod as any,
    items: mappedItems,
    notes: api.notes || '',
    subtotal: api.subtotal,
    tax: api.tax,
    serviceCharge: api.serviceCharge,
    tip: api.tip || 0,
    total: api.total,
    createdAt: typeof api.createdAt === 'string' ? api.createdAt : (api.createdAt as any).toISOString?.() || String(api.createdAt),
    updatedAt: typeof api.createdAt === 'string' ? api.createdAt : (api.createdAt as any).toISOString?.() || String(api.createdAt),
  }
}
