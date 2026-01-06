/**
 * Card Component - Olive Garden Design System
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/helpers';

/* ===================================
   CARD VARIANTS (CVA)
   =================================== */

const cardVariants = cva(
  [
    'rounded-lg bg-white',  // Updated: rounded-lg (12px) for cards
    'border border-[rgb(var(--border))]',
    'transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        flat: 'shadow-none',
        elevated: 'shadow-md hover:shadow-lg',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-5 lg:p-6',   // Responsive padding
        lg: 'p-6 lg:p-8',   // Responsive padding
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

/* ===================================
   CARD PROPS
   =================================== */

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/* ===================================
   CARD COMPONENT
   =================================== */

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, interactive, className })
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

/* ===================================
   CARD SUBCOMPONENTS
   =================================== */

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-[rgb(var(--neutral-900))]',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-[rgb(var(--neutral-600))]', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
