/**
 * TableFilters - Filter Controls for Tables
 * 
 * Provides filtering controls for tables list
 * Includes status, zone, and sort filters with clear option
 */

import React from 'react';
import { Select } from '@/shared/components';
import { STATUS_FILTER_OPTIONS, ZONE_FILTER_OPTIONS, SORT_OPTIONS } from '@/features/tables/model/constants';
import type { SortOption } from '@/features/tables/model/types';

interface TableFiltersProps {
  selectedStatus: string;
  selectedZone: string;
  sortOption: SortOption;
  onStatusChange: (status: string) => void;
  onZoneChange: (zone: string) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
}

export function TableFilters({
  selectedStatus,
  selectedZone,
  sortOption,
  onStatusChange,
  onZoneChange,
  onSortChange,
  onClearFilters,
}: TableFiltersProps) {
  const hasActiveFilters = selectedStatus !== 'All' || selectedZone !== 'All Locations';

  return (
    <div className="flex flex-col md:flex-row lg:flex-nowrap md:items-center gap-3 md:gap-4 mb-4">
      {/* Status Filter */}
      <div className="flex-1">
        <Select
          options={STATUS_FILTER_OPTIONS.map((option) => ({
            value: option,
            label: option,
          }))}
          value={selectedStatus}
          onChange={onStatusChange}
          size="lg"
          triggerClassName="w-full font-medium"
        />
      </div>

      {/* Zone Filter */}
      <div className="flex-1">
        <Select
          options={ZONE_FILTER_OPTIONS.map((option) => ({
            value: option,
            label: option,
          }))}
          value={selectedZone}
          onChange={onZoneChange}
          size="lg"
          triggerClassName="w-full font-medium"
        />
      </div>

      {/* Sort Filter */}
      <div className="flex-1">
        <Select
          options={SORT_OPTIONS.map((option) => ({
            value: option,
            label: option,
          }))}
          value={sortOption}
          onChange={(value) => onSortChange(value as SortOption)}
          size="lg"
          triggerClassName="w-full font-medium"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 sm:px-5 py-3 bg-elevated hover:bg-secondary text-text-secondary transition-colors whitespace-nowrap rounded-lg"
          style={{ fontSize: 'clamp(13px, 4vw, 15px)', fontWeight: 600, height: '48px' }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
