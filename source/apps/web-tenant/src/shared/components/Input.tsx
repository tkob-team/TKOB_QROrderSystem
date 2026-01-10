/**
 * Input Component - Olive Garden Design System
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/helpers';
import { Eye, EyeOff, Search } from 'lucide-react';

/* ===================================
   INPUT VARIANTS (CVA)
   =================================== */

const inputVariants = cva(
  [
    'flex w-full rounded-lg border px-3',
    'bg-white text-[rgb(var(--foreground))]',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-[rgb(var(--neutral-400))]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-[rgb(var(--border))]',
          'focus-visible:border-[rgb(var(--primary))]',
          'focus-visible:ring-[rgb(var(--primary-100))]',
        ],
        error: [
          'border-[rgb(var(--error))]',
          'focus-visible:ring-[rgb(var(--error-100))]',
        ],
      },
      inputSize: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

/* ===================================
   INPUT PROPS
   =================================== */

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Error message to display */
  error?: string;
  /** Label text */
  label?: string;
  /** Helper text below input */
  helperText?: string;
}

/* ===================================
   INPUT COMPONENT
   =================================== */

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type,
      error,
      label,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = !!error;
    const actualVariant = hasError ? 'error' : variant;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[rgb(var(--neutral-700))]"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(inputVariants({ variant: actualVariant, inputSize, className }))}
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-[rgb(var(--error))]"
          >
            {error}
          </p>
        )}
        {!hasError && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-[rgb(var(--neutral-500))]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ===================================
   PASSWORD INPUT (WITH TOGGLE)
   =================================== */

export type PasswordInputProps = Omit<InputProps, 'type'>;

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>((props, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10', props.className)}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-[50%] -translate-y-1/2 text-[rgb(var(--neutral-500))] hover:text-[rgb(var(--neutral-700))] transition-colors"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

/* ===================================
   SEARCH INPUT (WITH ICON)
   =================================== */

export interface SearchInputProps extends Omit<InputProps, 'type' | 'onSubmit'> {
  /** Called when input value changes (for local filtering/suggestions) */
  onSearch?: (value: string) => void;
  /** Called when user presses Enter (for API calls) */
  onSubmit?: (value: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onSubmit, className, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--neutral-500))]" />
        <Input
          {...props}
          ref={ref}
          type="search"
          className={cn('pl-9', className)}
          onChange={(e) => {
            props.onChange?.(e);
            onSearch?.(e.target.value);
          }}
          onKeyDown={(e) => {
            props.onKeyDown?.(e);
            if (e.key === 'Enter' && onSubmit) {
              e.preventDefault();
              onSubmit((e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

/* ===================================
   TEXTAREA
   =================================== */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[rgb(var(--neutral-700))]"
          >
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border px-3 py-2',
            'bg-white text-[rgb(var(--foreground))]',
            'placeholder:text-[rgb(var(--neutral-400))]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            hasError
              ? 'border-[rgb(var(--error))] focus-visible:ring-[rgb(var(--error-100))]'
              : 'border-[rgb(var(--border))] focus-visible:border-[rgb(var(--primary))] focus-visible:ring-[rgb(var(--primary-100))]',
            className
          )}
          ref={ref}
          id={textareaId}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          {...props}
        />
        {hasError && (
          <p
            id={`${textareaId}-error`}
            className="text-xs text-[rgb(var(--error))]"
          >
            {error}
          </p>
        )}
        {!hasError && helperText && (
          <p
            id={`${textareaId}-helper`}
            className="text-xs text-[rgb(var(--neutral-500))]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
