/**
 * Button Component - Olive Garden Design System
 * Based on Radix UI Slot primitive for composition
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/helpers';
import { Loader2 } from 'lucide-react';

/* ===================================
   BUTTON VARIANTS (CVA)
   =================================== */

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-200',
    'rounded-lg',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[rgb(var(--primary))] text-white',
          'hover:bg-[rgb(var(--primary-600))] hover:-translate-y-0.5',
          'active:bg-[rgb(var(--primary-700))] active:translate-y-0',
          'focus-visible:ring-[rgb(var(--primary-300))]',
          'shadow-sm hover:shadow-md active:shadow-sm',
        ],
        secondary: [
          'bg-[rgb(var(--neutral-100))]',
          'border border-[rgb(var(--border))]',
          'text-[rgb(var(--neutral-700))]',
          'hover:bg-[rgb(var(--neutral-200))] hover:text-[rgb(var(--neutral-900))]',
          'active:bg-[rgb(var(--neutral-300))]',
          'focus-visible:ring-[rgb(var(--neutral-300))]',
        ],
        outline: [
          'border-2 border-[rgb(var(--primary))]',
          'text-[rgb(var(--primary))]',
          'bg-transparent',
          'hover:bg-[rgb(var(--primary-50))] hover:-translate-y-0.5',
          'active:bg-[rgb(var(--primary-100))] active:translate-y-0',
          'focus-visible:ring-[rgb(var(--primary-300))]',
        ],
        ghost: [
          'text-[rgb(var(--neutral-700))]',
          'bg-transparent',
          'hover:bg-[rgb(var(--neutral-100))]',
          'active:bg-[rgb(var(--neutral-200))]',
          'focus-visible:ring-[rgb(var(--neutral-300))]',
        ],
        destructive: [
          'bg-[rgb(var(--error))] text-white',
          'hover:bg-[rgb(var(--error-600))] hover:-translate-y-0.5',
          'active:bg-[rgb(var(--error-700))] active:translate-y-0',
          'focus-visible:ring-[rgb(var(--error-100))]',
          'shadow-sm hover:shadow-md active:shadow-sm',
        ],
        link: [
          'text-[rgb(var(--primary))]',
          'underline-offset-4',
          'hover:underline',
          'p-0',
        ],
        // Success variant for positive actions
        success: [
          'bg-[rgb(var(--success))] text-white',
          'hover:bg-[rgb(var(--success-600))] hover:-translate-y-0.5',
          'active:bg-[rgb(var(--success-700))] active:translate-y-0',
          'focus-visible:ring-[rgb(var(--success-100))]',
          'shadow-sm hover:shadow-md active:shadow-sm',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-base', // Touch-first
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

/* ===================================
   BUTTON PROPS
   =================================== */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child component (for Next.js Link, etc.) */
  asChild?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Icon to display on the left */
  icon?: React.ReactNode;
  /** Icon to display on the right */
  iconRight?: React.ReactNode;
}

/* ===================================
   BUTTON COMPONENT
   =================================== */

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      icon,
      iconRight,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {icon && <span className="inline-flex shrink-0">{icon}</span>}
            {children}
            {iconRight && (
              <span className="inline-flex shrink-0">{iconRight}</span>
            )}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

/* ===================================
   ICON BUTTON (SPECIALIZED)
   =================================== */

export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconRight'> {
  icon: React.ReactNode;
  'aria-label': string; // Required for accessibility
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} className={className} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
