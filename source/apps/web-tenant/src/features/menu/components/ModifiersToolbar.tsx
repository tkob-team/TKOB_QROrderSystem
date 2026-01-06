'use client';

import React from 'react';
import { Plus, Filter, XCircle, X } from 'lucide-react';

type ModifiersToolbarProps = {
  visibleGroupsCount: number;
  selectedType: 'all' | 'single' | 'multiple';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFilterDropdown: boolean;
  onToggleFilterDropdown: () => void;
  tempSelectedType: 'all' | 'single' | 'multiple';
  onTempTypeChange: (type: 'all' | 'single' | 'multiple') => void;
  tempSelectedStatus: 'active' | 'all' | 'archived';
  onTempStatusChange: (status: 'active' | 'all' | 'archived') => void;
  singleCount: number;
  multiCount: number;
  activeCount: number;
  archivedCount: number;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onClearFilter: () => void;
  onNewGroup: () => void;
};

export function ModifiersToolbar({
  visibleGroupsCount,
  selectedType,
  searchQuery,
  onSearchChange,
  showFilterDropdown,
  onToggleFilterDropdown,
  tempSelectedType,
  onTempTypeChange,
  tempSelectedStatus,
  onTempStatusChange,
  singleCount,
  multiCount,
  activeCount,
  archivedCount,
  onApplyFilters,
  onResetFilters,
  onClearFilter,
  onNewGroup,
}: ModifiersToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h3
          className="text-gray-900"
          style={{ fontSize: '18px', fontWeight: 700 }}
        >
          All Groups
        </h3>
        {/* Count display disabled - server doesn't support count API yet */}
        {/* <span
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          {visibleGroupsCount} {visibleGroupsCount === 1 ? 'group' : 'groups'}
        </span> */}

        {(selectedType !== 'all' || searchQuery) && (
          <button
            onClick={onClearFilter}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Clear filter
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Filter button */}
        <div className="relative">
          <button
            onClick={onToggleFilterDropdown}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-emerald-400 transition-all"
            style={{
              fontSize: '15px',
              fontWeight: 600,
              borderRadius: '12px',
              height: '48px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          {/* Filter dropdown */}
          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Filter by Type</h4>
                  <button
                    onClick={onToggleFilterDropdown}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type-filter"
                        checked={tempSelectedType === 'all'}
                        onChange={() => onTempTypeChange('all')}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-sm text-gray-700">All Types</span>
                    </div>
                    {/* Count display disabled */}
                    {/* <span className="text-xs text-gray-500">{singleCount + multiCount}</span> */}
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type-filter"
                        checked={tempSelectedType === 'single'}
                        onChange={() => onTempTypeChange('single')}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-sm text-gray-700">Single Choice</span>
                    </div>
                    {/* Count display disabled */}
                    {/* <span className="text-xs text-gray-500">{singleCount}</span> */}
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type-filter"
                        checked={tempSelectedType === 'multiple'}
                        onChange={() => onTempTypeChange('multiple')}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-sm text-gray-700">Multiple Choice</span>
                    </div>
                    {/* Count display disabled */}
                    {/* <span className="text-xs text-gray-500">{multiCount}</span> */}
                  </label>
                </div>

                {/* Status Filter Section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Filter by Status</h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status-filter"
                          checked={tempSelectedStatus === 'active'}
                          onChange={() => onTempStatusChange('active')}
                          className="w-4 h-4 text-emerald-600"
                        />
                        <span className="text-sm text-gray-700">Active Groups</span>
                      </div>
                      {/* Count display disabled */}
                      {/* <span className="text-xs text-gray-500">{activeCount}</span> */}
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status-filter"
                          checked={tempSelectedStatus === 'all'}
                          onChange={() => onTempStatusChange('all')}
                          className="w-4 h-4 text-emerald-600"
                        />
                        <span className="text-sm text-gray-700">All Groups</span>
                      </div>
                      {/* Count display disabled */}
                      {/* <span className="text-xs text-gray-500">{archivedCount}</span> */}
                    </label>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={onResetFilters}
                    className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={onApplyFilters}
                    className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Group button */}
        <button
          onClick={onNewGroup}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white transition-all"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            borderRadius: '12px',
            height: '48px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <Plus className="w-5 h-5" />
          New Group
        </button>
      </div>
    </div>
  );
}
