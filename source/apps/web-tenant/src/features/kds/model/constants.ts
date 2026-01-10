/**
 * KDS (Kitchen Display System) - Constants & Configuration
 * Domain-level configurations only (NO React/lucide/Tailwind imports)
 */

import type { KdsColumnConfig, KdsStatusConfig } from './types';

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
 * Overdue threshold (in minutes)
 */
export const OVERDUE_THRESHOLD = 15;
