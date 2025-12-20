// Mock orders data

import { Order } from '@/types';

// Store created orders here
export const mockOrders: Order[] = [];

// Current active order
export let mockCurrentOrder: Order | null = null;

// Helper to set current order
export function setMockCurrentOrder(order: Order | null) {
  mockCurrentOrder = order;
}
