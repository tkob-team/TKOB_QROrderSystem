'use client';

import React from 'react';
import { Plus, Search, Filter, XCircle, X } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';
import { MODIFIER_TYPE_CONFIG, TYPE_FILTER_OPTIONS, MODIFIER_STATUS_FILTER_OPTIONS } from '../../../constants';

type ModifiersToolbarProps = {
  searchQuery: string;
  selectedType: 'all' | 'single' | 'multiple';
  _selectedStatus: 'all' | 'archived';
  tempSelectedType: 'all' | 'single' | 'multiple';
  tempSelectedStatus: 'all' | 'archived';
  showFilterDropdown: boolean;
  totalGroups: number;
  singleCount: number;
  multiCount: number;
  activeCount: number;
  archivedCount: number;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
  onTypeChange: (type: 'all' | 'single' | 'multiple') => void;
  onStatusChange: (status: 'all' | 'archived') => void;
  onTempTypeChange: (type: 'all' | 'single' | 'multiple') => void;
  onTempStatusChange: (status: 'all' | 'archived') => void;
  onApplyFilters: () => void;
  onToggleFilterDropdown: () => void;
  onClearFilters: () => void;
  onCreateGroup: () => void;
};

export function ModifiersToolbar({
  searchQuery,
  selectedType,
  _selectedStatus,
  tempSelectedType,
  tempSelectedStatus,
  showFilterDropdown,
  totalGroups,
  singleCount,
  multiCount,
  activeCount,
  archivedCount,
  onSearchChange,
  onSearchSubmit,
  onTypeChange: _onTypeChange,
  onStatusChange: _onStatusChange,
  onTempTypeChange,
  onTempStatusChange,
  onApplyFilters,
  onToggleFilterDropdown,
  onClearFilters,
  onCreateGroup,
}: ModifiersToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left: Title + Count + Clear Filter */}
      <div className="flex items-center gap-3">
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
          All Groups
        </h3>
        <span className="px-3 py-1 bg-elevated text-text-secondary rounded-full" style={{ fontSize: '13px', fontWeight: 600 }}>
          {totalGroups} {totalGroups === 1 ? 'group' : 'groups'}
        </span>

        {(selectedType !== 'all' || searchQuery) && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary bg-primary border border-default rounded-lg hover:bg-elevated transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Clear filter
          </button>
        )}
      </div>

      {/* Right: Search + Filter + Create */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search groups... (Press Enter)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onSearchSubmit) {
                onSearchSubmit();
              }
            }}
            className="pl-10 pr-4 py-2 text-sm border border-default rounded-lg focus:outline-none focus:border-accent-500 w-64"
          />
        </div>

        {/* Filter button with dropdown */}
        <div className="relative">
          <button
            onClick={onToggleFilterDropdown}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary bg-primary border border-default rounded-lg hover:bg-elevated transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
            {selectedType !== 'all' && (
              <Badge variant={MODIFIER_TYPE_CONFIG[selectedType].badgeColor}>
                {MODIFIER_TYPE_CONFIG[selectedType].label}
              </Badge>
            )}
          </button>

          {/* Filter dropdown */}
          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-primary border border-default rounded-lg shadow-lg z-20 overflow-hidden">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-text-primary">Filter by Type</h4>
                  <button
                    onClick={onToggleFilterDropdown}
                    className="text-text-tertiary hover:text-text-secondary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Type filters */}
                <div className="space-y-2">
                  {TYPE_FILTER_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-elevated cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="type-filter"
                          checked={tempSelectedType === option.value}
                          onChange={() => onTempTypeChange(option.value)}
                          className="w-4 h-4 text-accent-600"
                        />
                        <span className="text-sm text-text-secondary">{option.label}</span>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {option.value === 'all' ? totalGroups : option.value === 'single' ? singleCount : multiCount}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Status filters */}
                <div className="mt-4 pt-4 border-t border-default">
                  <h4 className="text-sm font-semibold text-text-primary mb-3">Filter by Status</h4>
                  <div className="space-y-2">
                    {MODIFIER_STATUS_FILTER_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-elevated cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="status-filter"
                            checked={tempSelectedStatus === option.value}
                            onChange={() => onTempStatusChange(option.value)}
                            className="w-4 h-4 text-accent-600"
                          />
                          <span className="text-sm text-text-secondary">{option.label}</span>
                        </div>
                        <span className="text-xs text-text-tertiary">
                          {option.value === 'all' ? activeCount : archivedCount}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Apply button */}
                <button
                  onClick={() => {
                    onApplyFilters();
                    onToggleFilterDropdown();
                  }}
                  className="w-full mt-4 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create button */}
        <button
          onClick={onCreateGroup}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-semibold">Create Group</span>
        </button>
      </div>
    </div>
  );
}
