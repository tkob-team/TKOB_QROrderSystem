import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton shimmer effect
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

interface CardSkeletonProps {
  /**
   * Number of cards to render
   */
  count?: number;
  className?: string;
}

/**
 * CardSkeleton Pattern
 * 
 * Loading state for card grids (menu items, orders, etc.)
 * 
 * @example
 * {isLoading ? <CardSkeleton count={6} /> : <OrdersGrid orders={data} />}
 */
export function CardSkeleton({ count = 3, className = '' }: CardSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Content lines */}
          <div className="space-y-2 mb-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface TableSkeletonProps {
  /**
   * Number of rows
   */
  rows?: number;
  /**
   * Number of columns
   */
  columns?: number;
  className?: string;
}

/**
 * TableSkeleton Pattern
 * 
 * Loading state for data tables
 * 
 * @example
 * {isLoading ? <TableSkeleton rows={5} columns={6} /> : <DataTable data={data} />}
 */
export function TableSkeleton({
  rows = 5,
  columns = 5,
  className = '',
}: TableSkeletonProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={`h-4 flex-1 ${colIndex === 0 ? 'max-w-[60%]' : ''}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ListSkeletonProps {
  /**
   * Number of list items
   */
  count?: number;
  className?: string;
}

/**
 * ListSkeleton Pattern
 * 
 * Loading state for vertical lists
 * 
 * @example
 * {isLoading ? <ListSkeleton count={8} /> : <OrdersList orders={data} />}
 */
export function ListSkeleton({ count = 5, className = '' }: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4"
        >
          {/* Avatar/Icon */}
          <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* Action */}
          <Skeleton className="h-8 w-20 rounded-md flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

/* Add shimmer animation to globals.css if not exists */
// @keyframes shimmer {
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// }
