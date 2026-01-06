/**
 * Tabs Component - TKOB Design System
 * Styled wrapper for Radix Tabs with design tokens
 */

'use client';

import React from 'react';
import { cn } from '@/shared/utils/helpers';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pill' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Tabs({
  items,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  className,
}: TabsProps) {
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-3',
    lg: 'text-base px-5 py-3.5',
  };

  const renderUnderlineTabs = () => (
    <div className={cn('border-b border-default', className)}>
      <div className="flex gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                sizeClasses[size],
                'relative font-semibold transition-colors flex items-center gap-2',
                isActive
                  ? 'text-[rgb(var(--primary))]'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.label}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[rgb(var(--primary))]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderPillTabs = () => (
    <div className={cn('inline-flex gap-1 p-1 bg-elevated rounded-lg', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              sizeClasses[size],
              'font-medium rounded-md transition-all flex items-center gap-2',
              isActive
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );

  const renderSolidTabs = () => (
    <div className={cn('inline-flex gap-1', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              sizeClasses[size],
              'font-semibold rounded-lg transition-all flex items-center gap-2',
              isActive
                ? 'bg-[rgb(var(--primary))] text-white shadow-sm'
                : 'bg-elevated text-text-secondary hover:bg-neutral-200 hover:text-text-primary'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );

  switch (variant) {
    case 'pill':
      return renderPillTabs();
    case 'solid':
      return renderSolidTabs();
    default:
      return renderUnderlineTabs();
  }
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return <div className={cn('mt-4', className)}>{children}</div>;
}
