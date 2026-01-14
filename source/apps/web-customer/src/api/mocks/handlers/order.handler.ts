// Mock handlers for order-related API calls

import { ApiResponse, Order, CartItem } from '@/types';
import { mockOrders, setMockCurrentOrder, loadOrdersFromStorage, saveOrdersToStorage } from '../data';
import { delay, createSuccessResponse, createErrorResponse } from '../utils';
import { readOrders, writeOrders, upsertOrder as upsertOrderInStorage } from '@/features/orders/data/mocks/orderStorage';
import { debugOrder } from '@/features/orders/dev/orderDebug';
import { log } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';

let orderIdCounter = 1;

/**
 * Initialize orders from storage or get from in-memory array
 * 
 * NOTE: tableId is required when available. Falls back to in-memory mockOrders if not provided.
 * This maintains backward compatibility while encouraging canonical storage use.
 */
function getOrInitializeOrders(tableId?: string, sessionId?: string): Order[] {
  // Prefer canonical storage if tableId is available
  if (tableId) {
    try {
      const stored = readOrders(tableId);
      if (stored.length > 0) {
        // Update in-memory array to match stored data for compatibility
        mockOrders.length = 0;
        mockOrders.push(...stored);
        return mockOrders;
      }
    } catch (err) {
      if (process.env.NEXT_PUBLIC_USE_LOGGING) {
        log('mock', 'Failed to load from canonical storage, using in-memory', { tableId: maskId(tableId), error: String(err) }, { feature: 'orders' });
      }
    }
  }

  // Fallback to old behavior for backward compatibility
  if (!sessionId) {
    return mockOrders;
  }

  const stored = loadOrdersFromStorage(sessionId);
  if (stored.length > 0) {
    mockOrders.length = 0;
    mockOrders.push(...stored);
    return mockOrders;
  }

  return mockOrders;
}

export const orderHandlers = {
  /**
   * Create new order
   * 
   * Uses canonical storage module to ensure deterministic persistence
   */
  async createOrder(data: {
    tableId: string;
    items: CartItem[];
    customerName?: string;
    notes?: string;
    paymentMethod: 'card' | 'counter';
  }): Promise<ApiResponse<Order>> {
    await delay(600);
    
    // Validate items
    if (!data.items || data.items.length === 0) {
      return createErrorResponse('Order must contain at least one item');
    }
    
    if (!data.tableId) {
      return createErrorResponse('tableId is required for order creation');
    }
    
    if (process.env.NEXT_PUBLIC_USE_LOGGING) {
      log('mock', 'Creating order', { itemsCount: data.items.length, tableId: maskId(data.tableId) }, { feature: 'orders' });
    }
    
    try {
      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => {
        let itemPrice = item.menuItem.basePrice;
        
        // Add size price
        if (item.selectedSize && item.menuItem.sizes) {
          const size = item.menuItem.sizes.find(s => s.size === item.selectedSize);
          if (size) {
            itemPrice = size.price;
          }
        }
        
        // Add topping prices
        if (item.menuItem.toppings) {
          item.selectedToppings.forEach(toppingId => {
            const topping = item.menuItem.toppings!.find(t => t.id === toppingId);
            if (topping) {
              itemPrice += topping.price;
            }
          });
        }
        
        return sum + (itemPrice * item.quantity);
      }, 0);
      
      const tax = subtotal * 0.1; // 10%
      const serviceCharge = subtotal * 0.05; // 5%
      const total = subtotal + tax + serviceCharge;
      
      // Create order with canonical payment status values
      const order: Order = {
        id: `order-${orderIdCounter++}`,
        tableNumber: '12',
        items: data.items,
        customerName: data.customerName,
        notes: data.notes,
        subtotal,
        tax,
        serviceCharge,
        total,
        paymentMethod: data.paymentMethod,
        // All orders start as Unpaid; payment handler updates to Paid after processing
        paymentStatus: 'Unpaid',
        status: 'Pending',
        createdAt: new Date(),
        estimatedReadyMinutes: 20,
      };
      
      // Log order creation with redacted data
      log(
        'mock',
        'Order created',
        {
          orderId: maskId(order.id),
          tableId: maskId(data.tableId),
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          itemCount: order.items.length,
          total: order.total,
        },
        { feature: 'orders', dedupe: false },
      );
      
      // Persist using canonical storage module
      upsertOrderInStorage(data.tableId, order);
      
      // Log structured event
      debugOrder('create-order', {
        tableId: data.tableId,
        orderId: order.id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        itemCount: order.items.length,
        total: order.total,
        storageKey: `tkob_mock_orders:${data.tableId}`,
        callsite: 'order.handler.createOrder',
      });
      
      // Also maintain in-memory reference for compatibility
      mockOrders.push(order);
      setMockCurrentOrder(order);
      
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        log(
          'mock',
          'Order created via canonical storage',
          { orderId: maskId(order.id), itemCount: order.items.length },
          { feature: 'orders' },
        );
      }
      
      return createSuccessResponse(order, 'Order placed successfully');
    } catch (err) {
      console.error('[Order Handler] Failed to create order:', err);
      return createErrorResponse('Failed to create order');
    }
  },
  
  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    await delay(300);
    
    const order = mockOrders.find(o => o.id === id);
    
    if (!order) {
      return createErrorResponse('Order not found');
    }
    
    return createSuccessResponse(order);
  },
  
  /**
   * Get order history for user
   */
  async getOrderHistory(userId: string, sessionId?: string): Promise<ApiResponse<Order[]>> {
    await delay(400);
    
    // Load orders from storage with session ID
    getOrInitializeOrders(sessionId);
    
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
      log(
        'mock',
        'Getting order history',
        { userId: maskId(userId), orderCount: mockOrders.length },
        { feature: 'orders' },
      );
    }
    
    // In real app, filter by userId
    // For mock, return all orders for the session
    return createSuccessResponse(mockOrders);
  },
  
  /**
   * Update order status (for testing)
   */
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    await delay(300);
    
    const order = mockOrders.find(o => o.id === orderId);
    
    if (!order) {
      return createErrorResponse('Order not found');
    }
    
    order.status = status;
    
    return createSuccessResponse(order, 'Order status updated');
  },
};
