// Order-related types

import { CartItem } from './cart';

export interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  customerName?: string;
  notes?: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  paymentMethod: 'card' | 'counter';
  paymentStatus: 'Paid' | 'Unpaid' | 'Failed';
  status: OrderStatus;
  createdAt: Date;
  estimatedReadyMinutes?: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Served'
  | 'Completed'
  | 'Cancelled';
