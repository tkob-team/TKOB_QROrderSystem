/**
 * Status and Tab Configuration
 * Maps order status to UI display and service board tabs
 */

import type { ServiceTab } from '../types';

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
