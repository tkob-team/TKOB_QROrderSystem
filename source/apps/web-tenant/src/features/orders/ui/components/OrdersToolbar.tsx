'use client';

import React from 'react';
import { Select } from '@/shared/components';
import { Search, X } from 'lucide-react';
import { OrderFilters } from '../../model/types';

interface OrdersToolbarProps {
  filters: OrderFilters;
  activeFilters: Array<{ key: string; label: string }>;
  onFilterChange: (key: keyof OrderFilters, value: string) => void;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

export function OrdersToolbar({
  filters,
  activeFilters,
  onFilterChange,
  onRemoveFilter,
  onClearAll,
}: OrdersToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search orders by ID or table..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-default bg-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm rounded-lg h-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'placed', label: 'Placed' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'preparing', label: 'Preparing' },
              { value: 'ready', label: 'Ready' },
              { value: 'served', label: 'Served' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={filters.statusFilter}
            onChange={(value) => onFilterChange('statusFilter', value)}
            size="md"
            triggerClassName="min-w-[150px]"
          />

          <Select
            options={[
              { value: 'all', label: 'All Tables' },
              { value: 'Table 2', label: 'Table 2' },
              { value: 'Table 3', label: 'Table 3' },
              { value: 'Table 5', label: 'Table 5' },
              { value: 'Table 6', label: 'Table 6' },
              { value: 'Table 7', label: 'Table 7' },
              { value: 'Table 8', label: 'Table 8' },
              { value: 'Table 9', label: 'Table 9' },
              { value: 'Table 12', label: 'Table 12' },
            ]}
            value={filters.tableFilter}
            onChange={(value) => onFilterChange('tableFilter', value)}
            size="md"
            triggerClassName="min-w-[140px]"
          />

          <Select
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
            ]}
            value={filters.dateFilter}
            onChange={(value) => onFilterChange('dateFilter', value)}
            size="md"
            triggerClassName="min-w-[140px]"
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-tertiary text-xs font-medium">
            Active:
          </span>
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onRemoveFilter(filter.key)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent-500/10 border border-accent-500/20 text-accent-500 hover:bg-accent-500/20 transition-colors text-xs font-medium rounded-full"
            >
              {filter.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={onClearAll}
            className="text-text-tertiary hover:text-text-secondary transition-colors text-xs font-medium underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
