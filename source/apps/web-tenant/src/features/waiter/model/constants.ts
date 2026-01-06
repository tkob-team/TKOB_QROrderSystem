/**
 * Waiter Service Board - Constants & Configuration
 * Status config, action mapping, and mock data
 */

import {
  Send,
  X,
  Check,
  CheckCircle,
  DollarSign,
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ServiceTab, ServiceOrder, OrderStatus } from './types';

/**
 * Order Status Configuration
 * Maps status to UI display (used with StatusPill)
 */
export const ORDER_STATUS_CONFIG = {
  placed: {
    label: 'Placed',
    color: 'blue' as const,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'amber' as const,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-700',
  },
  preparing: {
    label: 'Preparing',
    color: 'orange' as const,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
  },
  ready: {
    label: 'Ready',
    color: 'emerald' as const,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-700',
  },
  served: {
    label: 'Served',
    color: 'purple' as const,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700',
  },
  completed: {
    label: 'Completed',
    color: 'gray' as const,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-700',
  },
};

/**
 * Service Board Tab Configuration
 */
export const SERVICE_TABS: ServiceTab[] = [
  { id: 'placed', label: 'Placed' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready to Serve' },
  { id: 'served', label: 'Served' },
  { id: 'completed', label: 'Completed' },
];

/**
 * Action Button Configuration by Order Status
 */
export const ORDER_ACTION_CONFIG = {
  placed: {
    primary: {
      label: 'Accept & Send to Kitchen',
      icon: Send,
      className: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    secondary: {
      label: 'Reject',
      icon: X,
      className: 'bg-white hover:bg-red-50 border-2 border-red-500 text-red-600',
      shadow: 'none',
    },
  },
  confirmed: {
    primary: {
      label: 'Cancel Order',
      icon: X,
      className: 'bg-white hover:bg-red-50 border-2 border-red-500 text-red-600',
      shadow: 'none',
    },
  },
  preparing: {
    primary: {
      label: 'View Details',
      iconExpanded: ChevronUp,
      iconCollapsed: ChevronDown,
      className: 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700',
      shadow: 'none',
      minHeight: '40px',
    },
  },
  ready: {
    primary: {
      label: 'Mark as Served',
      icon: CheckCircle,
      className: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
      shadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
  },
  served: {
    primary: {
      label: 'Mark as Completed',
      icon: Check,
      className: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
      shadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
  },
  completed: {
    unpaid: {
      label: 'Mark as Paid',
      icon: DollarSign,
      className: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
      shadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
    paid: {
      label: 'Close Table',
      icon: LogOut,
      className: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
  },
};

/**
 * Touch-friendly button height standard
 */
export const BUTTON_HEIGHT = {
  primary: '48px', // Main action buttons (48px for touch)
  secondary: '40px', // Secondary actions
};

/**
 * Mock Service Orders (for demo)
 */
export const MOCK_SERVICE_ORDERS: ServiceOrder[] = [
  // Placed orders
  {
    id: '1',
    orderNumber: '#1250',
    table: 'Table 12',
    status: 'placed',
    paymentStatus: 'unpaid',
    placedTime: '1:15 PM',
    minutesAgo: 1,
    total: 45.50,
    items: [
      { name: 'Grilled Chicken Salad', quantity: 1, modifiers: ['Extra dressing', 'No croutons'] },
      { name: 'Coca Cola', quantity: 2 },
    ],
  },
  {
    id: '2',
    orderNumber: '#1251',
    table: 'Table 4',
    status: 'placed',
    paymentStatus: 'unpaid',
    placedTime: '1:14 PM',
    minutesAgo: 2,
    total: 68.00,
    items: [
      { name: 'Ribeye Steak', quantity: 1, modifiers: ['Medium rare', 'Garlic butter'] },
      { name: 'Mashed Potatoes', quantity: 1 },
      { name: 'Red Wine', quantity: 1, modifiers: ['House selection'] },
    ],
  },
  // Confirmed orders
  {
    id: '3',
    orderNumber: '#1248',
    table: 'Table 9',
    status: 'confirmed',
    paymentStatus: 'unpaid',
    placedTime: '1:10 PM',
    minutesAgo: 6,
    total: 32.50,
    items: [
      { name: 'Margherita Pizza', quantity: 1, modifiers: ['Thin crust', 'Extra basil'] },
      { name: 'Caesar Salad', quantity: 1 },
    ],
  },
  // Preparing orders
  {
    id: '4',
    orderNumber: '#1245',
    table: 'Table 5',
    status: 'preparing',
    paymentStatus: 'unpaid',
    placedTime: '1:00 PM',
    minutesAgo: 16,
    total: 89.00,
    items: [
      { name: 'Seafood Paella', quantity: 2, modifiers: ['Extra shrimp', 'No mussels'] },
      { name: 'Garlic Bread', quantity: 1 },
      { name: 'House Salad', quantity: 2, modifiers: ['Balsamic vinaigrette'] },
      { name: 'Sangria', quantity: 1, modifiers: ['Large pitcher'] },
    ],
  },
  {
    id: '5',
    orderNumber: '#1246',
    table: 'Table 7',
    status: 'preparing',
    paymentStatus: 'unpaid',
    placedTime: '1:05 PM',
    minutesAgo: 11,
    total: 56.50,
    items: [
      { name: 'Burger Deluxe', quantity: 2, modifiers: ['Medium', 'Extra cheese', 'No onions'] },
      { name: 'French Fries', quantity: 2, modifiers: ['Extra crispy'] },
      { name: 'Milkshake', quantity: 1, modifiers: ['Vanilla'] },
    ],
  },
  // Ready to serve orders
  {
    id: '6',
    orderNumber: '#1244',
    table: 'Table 3',
    status: 'ready',
    paymentStatus: 'unpaid',
    placedTime: '12:55 PM',
    minutesAgo: 5,
    total: 42.00,
    items: [
      { name: 'Pasta Carbonara', quantity: 1, modifiers: ['Extra bacon', 'Less cream'] },
      { name: 'Garden Salad', quantity: 1 },
      { name: 'Iced Tea', quantity: 1 },
    ],
  },
  {
    id: '7',
    orderNumber: '#1247',
    table: 'Table 2',
    status: 'ready',
    paymentStatus: 'unpaid',
    placedTime: '12:58 PM',
    minutesAgo: 2,
    total: 38.50,
    items: [
      { name: 'Grilled Salmon', quantity: 1, modifiers: ['Lemon butter sauce'] },
      { name: 'Steamed Vegetables', quantity: 1 },
    ],
  },
  // Completed orders
  {
    id: '8',
    orderNumber: '#1243',
    table: 'Table 8',
    status: 'completed',
    paymentStatus: 'paid',
    placedTime: '12:45 PM',
    minutesAgo: 15,
    total: 52.00,
    items: [
      { name: 'Fish & Chips', quantity: 1 },
      { name: 'Coleslaw', quantity: 1 },
    ],
  },
  {
    id: '9',
    orderNumber: '#1241',
    table: 'Table 1',
    status: 'completed',
    paymentStatus: 'unpaid',
    placedTime: '12:30 PM',
    minutesAgo: 28,
    total: 45.00,
    items: [
      { name: 'Chicken Wings', quantity: 1, modifiers: ['Spicy'] },
      { name: 'Onion Rings', quantity: 1 },
    ],
  },
  {
    id: '10',
    orderNumber: '#1242',
    table: 'Table 6',
    status: 'completed',
    paymentStatus: 'paid',
    placedTime: '12:35 PM',
    minutesAgo: 25,
    total: 36.00,
    items: [
      { name: 'Club Sandwich', quantity: 1 },
      { name: 'Sweet Potato Fries', quantity: 1 },
    ],
  },
];

/**
 * Sort orders by status
 * - Completed: newest first (smallest minutesAgo)
 * - All others: oldest first (highest minutesAgo)
 */
export const sortOrdersByStatus = (orders: ServiceOrder[], status: OrderStatus): ServiceOrder[] => {
  const filtered = orders.filter((order) => order.status === status);
  
  if (status === 'completed') {
    return [...filtered].sort((a, b) => a.minutesAgo - b.minutesAgo);
  }
  
  return [...filtered].sort((a, b) => b.minutesAgo - a.minutesAgo);
};
