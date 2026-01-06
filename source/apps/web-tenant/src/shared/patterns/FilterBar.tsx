import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/shared/components';

interface FilterBarProps {
  /**
   * Search input value
   */
  searchValue?: string;
  /**
   * Search input placeholder
   */
  searchPlaceholder?: string;
  /**
   * Search change handler
   */
  onSearchChange?: (value: string) => void;
  /**
   * Filters slot - insert select, dropdowns, date pickers, etc.
   */
  filters?: React.ReactNode;
  /**
   * Clear all filters handler
   */
  onClear?: () => void;
  /**
   * Show clear button
   */
  showClear?: boolean;
  className?: string;
}

/**
 * FilterBar Pattern
 * 
 * Reusable filter toolbar với search + custom filters slot.
 * Dùng trong Orders, Menu, Tables, Staff pages.
 * 
 * @example
 * <FilterBar
 *   searchValue={search}
 *   searchPlaceholder="Search orders..."
 *   onSearchChange={setSearch}
 *   filters={
 *     <>
 *       <select value={status} onChange={e => setStatus(e.target.value)}>
 *         <option>All Status</option>
 *         <option>Pending</option>
 *       </select>
 *     </>
 *   }
 *   onClear={handleClearFilters}
 * />
 */
export function FilterBar({
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  filters,
  onClear,
  showClear = true,
  className = '',
}: FilterBarProps) {
  const hasActiveFilters = searchValue || filters;

  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      {/* Search Input */}
      {onSearchChange && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Custom Filters Slot */}
      {filters && <div className="flex items-center gap-2">{filters}</div>}

      {/* Clear Button */}
      {showClear && hasActiveFilters && onClear && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-gray-600 hover:text-gray-900"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
