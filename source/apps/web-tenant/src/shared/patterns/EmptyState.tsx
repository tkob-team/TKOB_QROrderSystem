import React from 'react';
import { FileQuestion, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components';

interface EmptyStateProps {
  /**
   * Icon element (default: FileQuestion)
   */
  icon?: React.ReactNode;
  /**
   * Primary title
   */
  title: string;
  /**
   * Descriptive message
   */
  description?: string;
  /**
   * Primary action (e.g., "Add Item", "Clear Filters")
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Secondary action (optional)
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState Pattern
 * 
 * Standard empty state UI cho lists, tables, search results.
 * 
 * @example
 * <EmptyState
 *   icon={<ShoppingBag />}
 *   title="No orders yet"
 *   description="Orders will appear here when customers place them."
 *   action={{ label: 'View Menu', onClick: handleViewMenu }}
 * />
 */
export function EmptyState({
  icon = <FileQuestion className="w-12 h-12 text-gray-400" />,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className="mb-4">{icon}</div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 max-w-md mb-6">{description}</p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick} variant="primary">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  /**
   * Error title
   */
  title?: string;
  /**
   * Error message
   */
  message?: string;
  /**
   * Retry action
   */
  onRetry?: () => void;
  className?: string;
}

/**
 * ErrorState Pattern
 * 
 * Standard error UI cho failed API calls, network errors.
 * 
 * @example
 * <ErrorState
 *   title="Failed to load orders"
 *   message="Please check your connection and try again."
 *   onRetry={refetch}
 * />
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading data. Please try again.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Error Icon */}
      <div className="mb-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Message */}
      <p className="text-sm text-gray-600 max-w-md mb-6">{message}</p>

      {/* Retry Button */}
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      )}
    </div>
  );
}
