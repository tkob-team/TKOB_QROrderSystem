// Order-related types

import { CartItem } from './cart';

export type PaymentMethod = 'BILL_TO_TABLE' | 'SEPAY_QR' | 'CARD_ONLINE' | 'card' | 'counter';

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
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Unpaid' | 'Failed' | 'PENDING' | 'COMPLETED';
  status: OrderStatus;
  createdAt: Date;
  estimatedReadyMinutes?: number;
}

// NOTE: Backend API returns UPPERCASE status strings
// RECEIVED = "Accepted" in UI display
export type OrderStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED'
  // Legacy Title Case values for backward compatibility
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Served'
  | 'Completed'
  | 'Cancelled';
