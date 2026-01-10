/**
 * Orders Feature - Type Definitions
 */

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  table: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  time: string;
  date: string;
  createdAt: string;
  timeline: {
    placed?: string;
    confirmed?: string;
    preparing?: string;
    ready?: string;
    served?: string;
    completed?: string;
    cancelled?: string;
  };
}

export interface OrderFilters {
  statusFilter: string;
  tableFilter: string;
  dateFilter: string;
  searchQuery: string;
}

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmText: string;
  confirmVariant: 'danger' | 'primary';
  onConfirm: () => void;
}
