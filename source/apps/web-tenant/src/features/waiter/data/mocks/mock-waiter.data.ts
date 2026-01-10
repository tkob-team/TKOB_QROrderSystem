/**
 * Waiter Mock Data
 * Mock service orders for demo
 */

import type { ServiceOrder } from '../../model/types';

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
  // Served orders
  {
    id: '11',
    orderNumber: '#1249',
    table: 'Table 10',
    status: 'served',
    paymentStatus: 'unpaid',
    placedTime: '1:12 PM',
    minutesAgo: 4,
    total: 28.00,
    items: [
      { name: 'Tomato Soup', quantity: 1 },
      { name: 'Grilled Cheese', quantity: 1 },
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
