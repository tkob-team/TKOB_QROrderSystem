/**
 * KDS (Kitchen Display System) - Constants & Configuration
 */

import type { KdsColumnConfig, KdsStatusConfig, KdsOrder } from './types';
import { Play, Check } from 'lucide-react';

/**
 * KDS Status Configuration
 * Maps status to UI colors and labels
 */
export const KDS_STATUS_CONFIG: Record<string, KdsStatusConfig> = {
  pending: {
    label: 'Pending',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-500',
  },
  cooking: {
    label: 'Cooking',
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-500',
  },
  ready: {
    label: 'Ready',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-500',
  },
  overdue: {
    label: 'Overdue',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-500',
  },
};

/**
 * KDS Column Configuration
 */
export const KDS_COLUMNS: KdsColumnConfig[] = [
  {
    id: 'new',
    title: 'NEW',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-500',
  },
  {
    id: 'preparing',
    title: 'PREPARING',
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-500',
  },
  {
    id: 'ready',
    title: 'READY',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-500',
  },
];

/**
 * Button configuration by column
 */
export const KDS_BUTTON_CONFIG = {
  new: {
    text: 'Start Prep',
    icon: Play,
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  preparing: {
    text: 'Mark Ready',
    icon: Check,
    className: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  ready: {
    text: 'Served',
    icon: Check,
    className: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
};

/**
 * Mock KDS Orders (for demo)
 */
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

/**
 * Time format helper (extracted from component)
 */
export const formatKdsTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Overdue threshold (in minutes)
 */
export const OVERDUE_THRESHOLD = 15;
