'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, Filter, XCircle } from './icons';
import { ItemsFilterPanel } from './ItemsFilterPanel';
import { useDebounce } from '../hooks/useDebounce';

type ItemsToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  tempSelectedStatus: string;
  onTempStatusChange: (status: string) => void;
  selectedAvailability: 'all' | 'available' | 'unavailable';
  tempSelectedAvailability: 'all' | 'available' | 'unavailable';
  onTempAvailabilityChange: (availability: 'all' | 'available' | 'unavailable') => void;
  selectedChefRecommended: boolean;
  tempSelectedChefRecommended: boolean;
  onTempChefRecommendedChange: (checked: boolean) => void;
  showFilter: boolean;
  onToggleFilter: () => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  onAddItem: () => void;
  onClearFilter?: () => void;
};

export function ItemsToolbar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  tempSelectedStatus,
  onTempStatusChange,
  selectedAvailability,
  tempSelectedAvailability,
  onTempAvailabilityChange,
  selectedChefRecommended,
  tempSelectedChefRecommended,
  onTempChefRecommendedChange,
  showFilter,
  onToggleFilter,
  onResetFilters,
  onApplyFilters,
  sortOption,
  onSortChange,
  onAddItem,
  onClearFilter,
}: ItemsToolbarProps) {
  // Local state for search input (immediate feedback)
  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);
  
  // Debounced search value (500ms delay)
  const debouncedSearchQuery = useDebounce(localSearchInput, 500);

  // Update parent when debounced value changes
  useEffect(() => {
    onSearchChange(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearchChange]);

  // Sync local input with parent when searchQuery prop changes (e.g., from reset)
  useEffect(() => {
    setLocalSearchInput(searchQuery);
  }, [searchQuery]);

  return (
    <div className="px-5 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative w-full max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={localSearchInput}
            onChange={(e) => setLocalSearchInput(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 rounded-xl text-sm h-10"
          />
        </div>

        {/* Status + Availability + Sort + Add Item */}
        <div className="flex items-center gap-2 shrink-0 ml-auto relative">
          {/* Filter button - replaces dropdown selects */}
          <div className="relative">
            <button
              onClick={onToggleFilter}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-emerald-400 transition-all rounded-xl h-10"
              style={{
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {/* Filter Panel */}
            <ItemsFilterPanel
              showFilter={showFilter}
              onToggleFilter={onToggleFilter}
              tempSelectedStatus={tempSelectedStatus}
              onTempStatusChange={onTempStatusChange}
              tempSelectedAvailability={tempSelectedAvailability}
              onTempAvailabilityChange={onTempAvailabilityChange}
              tempSelectedChefRecommended={tempSelectedChefRecommended}
              onTempChefRecommendedChange={onTempChefRecommendedChange}
              onResetFilters={onResetFilters}
              onApplyFilters={onApplyFilters}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white text-gray-700 cursor-pointer rounded-xl text-sm font-medium min-w-40 h-10"
            >
              <option>Sort by: Newest</option>
              <option>Sort by: Popularity</option>
              <option>Sort by: Price (Low)</option>
              <option>Sort by: Price (High)</option>
              <option>Sort by: Name (A-Z)</option>
              <option>Sort by: Name (Z-A)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Add Item button */}
          <button
            onClick={onAddItem}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium h-10 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Clear filter indicator */}
      {(selectedStatus !== 'All Status' || selectedAvailability !== 'all' || selectedChefRecommended) && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            Filters: {selectedStatus !== 'All Status' && `${selectedStatus}`} {selectedAvailability !== 'all' && `${selectedAvailability.charAt(0).toUpperCase() + selectedAvailability.slice(1)}`} {selectedChefRecommended && 'Chef Recommended'}
          </span>
          {onClearFilter && (
            <button
              onClick={onClearFilter}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
            >
              <XCircle className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
