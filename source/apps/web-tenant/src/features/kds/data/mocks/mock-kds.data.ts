/**
 * KDS Mock Data
 * Raw mock constants for kitchen display orders
 */

import type { KdsOrder } from '../../model/types';

export const MOCK_KDS_ORDERS: KdsOrder[] = [
  // Pending orders
  {
    id: '#1247',
    table: 'Table 7',
    time: 2,
    items: [
      {
        name: 'Caesar Salad',
        quantity: 2,
        modifiers: ['No croutons', 'Extra dressing'],
      },
      {
        name: 'Margherita Pizza',
        quantity: 1,
        modifiers: ['Thin crust', 'Extra basil'],
      },
      { name: 'Coca Cola', quantity: 2 },
    ],
    isOverdue: false,
    status: 'pending',
  },
  {
    id: '#1248',
    table: 'Table 2',
    time: 1,
    items: [
      {
        name: 'Grilled Salmon',
        quantity: 1,
        modifiers: ['Medium rare', 'No butter'],
        notes: 'Allergy: shellfish',
      },
      { name: 'Mashed Potato', quantity: 1 },
    ],
    isOverdue: false,
    status: 'pending',
  },
  {
    id: '#1249',
    table: 'Table 12',
    time: 0,
    items: [
      {
        name: 'Burger Deluxe',
        quantity: 1,
        modifiers: ['Medium well', 'Extra cheese', 'No onions'],
      },
      { name: 'French Fries', quantity: 1, modifiers: ['Extra crispy'] },
      { name: 'Milkshake', quantity: 1, modifiers: ['Vanilla'] },
    ],
    isOverdue: false,
    status: 'pending',
  },
  // Preparing orders
  {
    id: '#1245',
    table: 'Table 5',
    time: 8,
    items: [
      {
        name: 'Ribeye Steak',
        quantity: 1,
        modifiers: ['Medium', 'Peppercorn sauce'],
      },
      { name: 'Grilled Vegetables', quantity: 1 },
      { name: 'Red Wine', quantity: 1, modifiers: ['Chilled'] },
    ],
    isOverdue: false,
    status: 'preparing',
  },
  {
    id: '#1244',
    table: 'Table 3',
    time: 16,
    items: [
      {
        name: 'Pasta Carbonara',
        quantity: 2,
        modifiers: ['Extra bacon', 'Less cream'],
      },
      { name: 'Garlic Bread', quantity: 1 },
      { name: 'House Salad', quantity: 1, modifiers: ['Balsamic dressing'] },
    ],
    isOverdue: true,
    status: 'preparing',
  },
  // Ready orders
  {
    id: '#1243',
    table: 'Table 8',
    time: 2,
    items: [
      {
        name: 'Fish & Chips',
        quantity: 1,
        modifiers: ['Extra tartar sauce'],
      },
      { name: 'Coleslaw', quantity: 1 },
      { name: 'Lemon Water', quantity: 1 },
    ],
    isOverdue: false,
    status: 'ready',
  },
  {
    id: '#1242',
    table: 'Table 1',
    time: 4,
    items: [
      {
        name: 'Chicken Wings',
        quantity: 1,
        modifiers: ['Spicy', 'Blue cheese dip'],
      },
      { name: 'Onion Rings', quantity: 1 },
    ],
    isOverdue: false,
    status: 'ready',
  },
];
