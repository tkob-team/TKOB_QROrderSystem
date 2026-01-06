/**
 * Pagination Component - TKOB Design System
 * Reusable pagination với info text và navigation buttons
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/shared/utils/helpers';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  showInfo?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  showPageNumbers = true,
  showInfo = true,
  className,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to show
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {/* Info Text */}
      {showInfo && (
        <p className="text-sm text-text-secondary">
          Showing <span className="font-medium text-text-primary">{startItem}</span>
          {' - '}
          <span className="font-medium text-text-primary">{endItem}</span>
          {' of '}
          <span className="font-medium text-text-primary">{totalItems}</span>
        </p>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
          className={cn(
            'p-2 rounded-lg transition-all',
            canGoPrev
              ? 'text-text-secondary hover:text-text-primary hover:bg-elevated'
              : 'text-text-tertiary cursor-not-allowed opacity-50'
          )}
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className={cn(
            'p-2 rounded-lg transition-all',
            canGoPrev
              ? 'text-text-secondary hover:text-text-primary hover:bg-elevated'
              : 'text-text-tertiary cursor-not-allowed opacity-50'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((page, index) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-text-tertiary">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all',
                    currentPage === page
                      ? 'bg-[rgb(var(--primary))] text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                  )}
                >
                  {page}
                </button>
              )
            ))}
          </div>
        )}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={cn(
            'p-2 rounded-lg transition-all',
            canGoNext
              ? 'text-text-secondary hover:text-text-primary hover:bg-elevated'
              : 'text-text-tertiary cursor-not-allowed opacity-50'
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className={cn(
            'p-2 rounded-lg transition-all',
            canGoNext
              ? 'text-text-secondary hover:text-text-primary hover:bg-elevated'
              : 'text-text-tertiary cursor-not-allowed opacity-50'
          )}
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Simple Pagination (just prev/next)
 */
interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          canGoPrev
            ? 'text-text-primary hover:bg-elevated'
            : 'text-text-tertiary cursor-not-allowed'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <span className="text-sm text-text-secondary">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          canGoNext
            ? 'text-text-primary hover:bg-elevated'
            : 'text-text-tertiary cursor-not-allowed'
        )}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
