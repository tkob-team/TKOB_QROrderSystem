/**
 * Dropdown Select Component - TKOB Design System
 * Beautiful custom styled dropdown using Radix UI
 */

'use client';

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/shared/utils/helpers';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  triggerClassName?: string;
  id?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  size = 'md',
  className,
  triggerClassName,
}: SelectProps) {
  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4',
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            sizeClasses[size],
            'inline-flex items-center justify-between gap-2 rounded-lg border bg-white',
            'text-text-primary cursor-pointer',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'data-[placeholder]:text-text-tertiary',
            error
              ? 'border-[rgb(var(--error))] focus:ring-[rgb(var(--error-100))]'
              : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary-400))] focus:border-[rgb(var(--primary))] focus:ring-[rgb(var(--primary-100))]',
            disabled && 'opacity-50 cursor-not-allowed bg-elevated',
            triggerClassName
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              'relative z-50 max-h-80 min-w-[8rem] overflow-hidden',
              'bg-white rounded-lg border border-[rgb(var(--border))]',
              'shadow-lg shadow-black/10',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
            )}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-white cursor-default">
              <ChevronUp className="h-4 w-4" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center',
                    'rounded-lg py-2 pl-8 pr-3 text-sm outline-none',
                    'text-text-primary',
                    'focus:bg-[rgb(var(--primary-50))] focus:text-[rgb(var(--primary-700))]',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    'transition-colors duration-150'
                  )}
                >
                  <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4 text-[rgb(var(--primary))]" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-white cursor-default">
              <ChevronDown className="h-4 w-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && (
        <p className="text-sm text-[rgb(var(--error))]">{error}</p>
      )}
    </div>
  );
}

/**
 * Multi-Select component (uses checkboxes)
 */
interface MultiSelectProps {
  options: SelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  className?: string;
}

export function MultiSelect({
  options,
  values,
  onChange,
  label,
  className,
}: MultiSelectProps) {
  const handleToggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <span className="text-sm font-medium text-text-primary">{label}</span>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              disabled={option.disabled}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                'border',
                isSelected
                  ? 'bg-[rgb(var(--primary))] text-white border-[rgb(var(--primary))]'
                  : 'bg-white text-text-secondary border-default hover:border-[rgb(var(--primary-400))] hover:text-text-primary',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
