/**
 * Badge Component - Olive Garden Design System
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/helpers';

/* ===================================
   BADGE VARIANTS (CVA)
   =================================== */

const badgeVariants = cva(
  [
    'inline-flex items-center justify-center gap-1',
    'font-medium',
    'rounded-full',
    'transition-colors duration-200',
    'whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-[rgb(var(--neutral-100))]',
          'text-[rgb(var(--neutral-700))]',
          'border border-[rgb(var(--neutral-200))]',
        ],
        primary: [
          'bg-[rgb(var(--primary-100))]',
          'text-[rgb(var(--primary-700))]',
          'border border-[rgb(var(--primary-200))]',
        ],
        success: [
          'bg-[rgb(var(--success-100))]',
          'text-[rgb(var(--success-700))]',
          'border border-[rgb(var(--success-200))]',
        ],
        warning: [
          'bg-[rgb(var(--warning-100))]',
          'text-[rgb(var(--warning-700))]',
          'border border-[rgb(var(--warning-200))]',
        ],
        error: [
          'bg-[rgb(var(--error-100))]',
          'text-[rgb(var(--error-700))]',
          'border border-[rgb(var(--error-200))]',
        ],
        info: [
          'bg-[rgb(var(--info-100))]',
          'text-[rgb(var(--info-700))]',
          'border border-[rgb(var(--info-200))]',
        ],
        // Solid variants
        primarySolid: [
          'bg-[rgb(var(--primary))]',
          'text-white',
          'border-0',
        ],
        successSolid: [
          'bg-[rgb(var(--success))]',
          'text-white',
          'border-0',
        ],
        warningSolid: [
          'bg-[rgb(var(--warning))]',
          'text-white',
          'border-0',
        ],
        errorSolid: [
          'bg-[rgb(var(--error))]',
          'text-white',
          'border-0',
        ],
        infoSolid: [
          'bg-[rgb(var(--info))]',
          'text-white',
          'border-0',
        ],
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] leading-tight',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

/* ===================================
   BADGE PROPS
   =================================== */

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional icon to display */
  icon?: React.ReactNode;
}

/* ===================================
   BADGE COMPONENT
   =================================== */

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/* ===================================
   STATUS BADGE (SPECIALIZED)
   =================================== */

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'billing';

const statusConfig: Record<
  OrderStatus | TableStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  // Order statuses
  placed: { label: 'Placed', variant: 'info' },
  confirmed: { label: 'Confirmed', variant: 'primary' },
  preparing: { label: 'Preparing', variant: 'warning' },
  ready: { label: 'Ready', variant: 'success' },
  served: { label: 'Served', variant: 'default' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  // Table statuses
  available: { label: 'Available', variant: 'successSolid' },
  occupied: { label: 'Occupied', variant: 'errorSolid' },
  reserved: { label: 'Reserved', variant: 'infoSolid' },
  billing: { label: 'Billing', variant: 'warningSolid' },
};

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: OrderStatus | TableStatus;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const config = statusConfig[status];
    return (
      <Badge ref={ref} variant={config.variant} {...props}>
        {config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
