// Mock handlers for order-related API calls

import { ApiResponse, Order, CartItem } from '@/types';
import { mockOrders, setMockCurrentOrder } from '../data';
import { delay, createSuccessResponse, createErrorResponse } from '../utils';

let orderIdCounter = 1;

export const orderHandlers = {
  /**
   * Create new order
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
    
    // Create order
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
      paymentStatus: data.paymentMethod === 'counter' ? 'Unpaid' : 'Paid',
      status: 'Pending',
      createdAt: new Date(),
      estimatedReadyMinutes: 20,
    };
    
    // Store order
    mockOrders.push(order);
    setMockCurrentOrder(order);
    
    return createSuccessResponse(order, 'Order placed successfully');
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
  async getOrderHistory(userId: string): Promise<ApiResponse<Order[]>> {
    await delay(400);
    
    // In real app, filter by userId
    // For mock, return all orders
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
