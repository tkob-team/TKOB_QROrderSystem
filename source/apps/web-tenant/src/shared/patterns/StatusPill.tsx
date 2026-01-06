import React from 'react';
import {
  ShoppingBag,
  Check,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  CreditCard,
  DollarSign,
  Users,
  Lock,
  Ban,
} from 'lucide-react';

/**
 * Status tone mapping to colors
 */
export type StatusTone =
  | 'success'    // Green - completed, paid, active
  | 'warning'    // Amber - pending, preparing
  | 'error'      // Red - cancelled, failed, error
  | 'info'       // Blue - placed, new, confirmed
  | 'neutral'    // Gray - inactive, draft
  | 'purple'     // Purple - ready, special
  | 'orange';    // Orange - preparing, in-progress

interface StatusPillProps {
  /**
   * Display label
   */
  label: string;
  /**
   * Visual tone/color scheme
   */
  tone?: StatusTone;
  /**
   * Optional icon element
   */
  icon?: React.ReactNode;
  /**
   * Pill size variant
   */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

/**
 * StatusPill Pattern
 * 
 * Configurable status badge thay thế cho hard-coded Badge variants.
 * Dùng mapping function thay vì if-else trong components.
 * 
 * @example
 * // Define mapping once
 * const getOrderStatusConfig = (status: OrderStatus) => {
 *   const map = {
 *     placed: { label: 'Placed', tone: 'info' as const },
 *     preparing: { label: 'Preparing', tone: 'warning' as const },
 *     completed: { label: 'Completed', tone: 'success' as const },
 *   };
 *   return map[status];
 * };
 * 
 * // Use in component
 * <StatusPill {...getOrderStatusConfig(order.status)} />
 */
export function StatusPill({
  label,
  tone = 'neutral',
  icon,
  size = 'md',
  className = '',
}: StatusPillProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${TONE_CLASSES[tone]}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}

/**
 * Status Config Interface
 * 
 * Extended config với allowedActions và icons.
 */
export interface StatusConfig {
  label: string;
  tone: StatusTone;
  icon?: React.ReactNode;
  /**
   * List of allowed next statuses (for workflow transitions)
   */
  allowedNextStatuses?: string[];
}

/**
 * Status Config Factories
 * 
 * Pre-built mapping functions for common statuses.
 * Import và dùng trực tiếp thay vì define lại mỗi component.
 */

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'inactive';

/**
 * ORDER STATUS CONFIG
 * 
 * Workflow: placed → confirmed → preparing → ready → served → completed
 * Can cancel at any point before served.
 */
export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  placed: {
    label: 'Placed',
    tone: 'info',
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    allowedNextStatuses: ['confirmed', 'cancelled'],
  },
  confirmed: {
    label: 'Confirmed',
    tone: 'info',
    icon: <Check className="w-3.5 h-3.5" />,
    allowedNextStatuses: ['preparing', 'cancelled'],
  },
  preparing: {
    label: 'Preparing',
    tone: 'warning',
    icon: <ChefHat className="w-3.5 h-3.5" />,
    allowedNextStatuses: ['ready', 'cancelled'],
  },
  ready: {
    label: 'Ready',
    tone: 'purple',
    icon: <Clock className="w-3.5 h-3.5" />,
    allowedNextStatuses: ['served', 'cancelled'],
  },
  served: {
    label: 'Served',
    tone: 'success',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    allowedNextStatuses: ['completed'],
  },
  completed: {
    label: 'Completed',
    tone: 'success',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    allowedNextStatuses: [],
  },
  cancelled: {
    label: 'Cancelled',
    tone: 'error',
    icon: <XCircle className="w-3.5 h-3.5" />,
    allowedNextStatuses: [],
  },
};

/**
 * PAYMENT STATUS CONFIG
 */
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
  paid: {
    label: 'Paid',
    tone: 'success',
    icon: <CreditCard className="w-3.5 h-3.5" />,
  },
  unpaid: {
    label: 'Unpaid',
    tone: 'warning',
    icon: <DollarSign className="w-3.5 h-3.5" />,
  },
  refunded: {
    label: 'Refunded',
    tone: 'neutral',
    icon: <CreditCard className="w-3.5 h-3.5" />,
  },
};

/**
 * TABLE STATUS CONFIG
 */
export const TABLE_STATUS_CONFIG: Record<TableStatus, StatusConfig> = {
  available: {
    label: 'Available',
    tone: 'success',
    icon: <Check className="w-3.5 h-3.5" />,
    allowedNextStatuses: ['occupied', 'reserved', 'inactive'],
  },
  occupied: {
    label: 'Occupied',
    tone: 'error',
    icon: <Users className="w-3.5 h-3.5" />,
    allowedNextStatuses: ['available'],
  },
  reserved: {
    label: 'Reserved',
    tone: 'warning',
    icon: <Lock className="w-3.5 h-3.5" />,
    allowedNextStatuses: ['occupied', 'available'],
  },
  inactive: {
    label: 'Inactive',
    tone: 'neutral',
    icon: <Ban className="w-3.5 h-3.5" />,
    allowedNextStatuses: ['available'],
  },
};

/**
 * Helper: Get allowed actions for a status
 */
export function getAllowedNextStatuses(
  currentStatus: OrderStatus | TableStatus,
  configMap: Record<string, StatusConfig>
): string[] {
  return configMap[currentStatus]?.allowedNextStatuses || [];
}
