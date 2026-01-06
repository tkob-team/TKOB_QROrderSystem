/**
 * StatCard Component - Smart Restaurant Design System
 * KPI/Statistic card with colorful icon, value, trend indicator
 * More vibrant colors matching Smart Restaurant reference
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/helpers';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

/* ===================================
   STAT CARD VARIANTS (CVA)
   =================================== */

const statCardVariants = cva(
  [
    'flex flex-col gap-4 p-6 rounded-2xl bg-white border transition-all duration-300',
    'hover:shadow-xl hover:-translate-y-1 hover:border-transparent',
  ],
  {
    variants: {
      variant: {
        default: 'border-gray-100 hover:shadow-gray-200/50',
        primary: 'border-emerald-100 hover:shadow-emerald-200/50',
        success: 'border-green-100 hover:shadow-green-200/50',
        warning: 'border-amber-100 hover:shadow-amber-200/50',
        error: 'border-red-100 hover:shadow-red-200/50',
        info: 'border-blue-100 hover:shadow-blue-200/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/* ===================================
   ICON BACKGROUND STYLES
   =================================== */

const iconStyles = {
  default: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600',
  primary: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30',
  success: 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30',
  warning: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30',
  error: 'bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-lg shadow-red-500/30',
  info: 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30',
};

/* ===================================
   STAT CARD PROPS
   =================================== */

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  /** Card title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Optional trend percentage (e.g., "+9.1%" or "-2.5%") */
  trend?: string;
  /** Trend direction for color coding */
  trendDirection?: 'up' | 'down' | 'neutral';
  /** Optional subtitle/description */
  subtitle?: string;
}

/* ===================================
   STAT CARD COMPONENT
   =================================== */

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      variant = 'default',
      title,
      value,
      icon: Icon,
      trend,
      trendDirection = 'neutral',
      subtitle,
      ...props
    },
    ref
  ) => {
    const variantKey = variant || 'default';

    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant, className }))}
        {...props}
      >
        {/* Header: Icon + Trend */}
        <div className="flex items-center justify-between">
          {Icon && (
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-lg',
                iconStyles[variantKey]
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={2} />
            </div>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold',
                trendDirection === 'up' && 'bg-green-100 text-green-700',
                trendDirection === 'down' && 'bg-red-100 text-red-700',
                trendDirection === 'neutral' && 'bg-gray-100 text-gray-700'
              )}
            >
              {trendDirection === 'up' && (
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
              {trendDirection === 'down' && (
                <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>

        {/* Value */}
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold text-gray-900 stat-value tracking-tight">
            {value}
          </div>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
