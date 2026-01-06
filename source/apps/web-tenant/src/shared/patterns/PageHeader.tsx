import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /**
   * Right-side actions slot (buttons, filters, etc.)
   */
  actions?: React.ReactNode;
  /**
   * Optional breadcrumbs component
   */
  breadcrumbs?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader Pattern
 * 
 * Standard page header với title, subtitle, và actions slot.
 * Dùng cho tất cả admin pages để consistent UX.
 * 
 * @example
 * <PageHeader
 *   title="Dashboard"
 *   subtitle="Overview of your restaurant performance"
 *   actions={<Button>Export</Button>}
 *   breadcrumbs={<Breadcrumbs items={[...]} />}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
