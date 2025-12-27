'use client';

import React from 'react';
import { X } from 'lucide-react';

type ItemsFilterPanelProps = {
  showFilter: boolean;
  onToggleFilter: () => void;
  tempSelectedStatus: string;
  onTempStatusChange: (status: string) => void;
  tempSelectedAvailability: 'all' | 'available' | 'unavailable';
  onTempAvailabilityChange: (availability: 'all' | 'available' | 'unavailable') => void;
  tempSelectedChefRecommended: boolean;
  onTempChefRecommendedChange: (checked: boolean) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
};

export function ItemsFilterPanel({
  showFilter,
  onToggleFilter,
  tempSelectedStatus,
  onTempStatusChange,
  tempSelectedAvailability,
  onTempAvailabilityChange,
  tempSelectedChefRecommended,
  onTempChefRecommendedChange,
  onResetFilters,
  onApplyFilters,
}: ItemsFilterPanelProps) {
  if (!showFilter) return null;

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900">Filter</h4>
          <button
            onClick={onToggleFilter}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Filter */}
        <div>
          <h5 className="text-sm font-semibold text-gray-900 mb-1">Filter by Status</h5>
          <div className="space-y-2">
            <label className="flex items-center p-1 mb-0 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="status-filter"
                checked={tempSelectedStatus === 'All Status'}
                onChange={() => onTempStatusChange('All Status')}
                className="w-4 h-4 text-emerald-600"
              />
              <span className="text-sm text-gray-700 ml-2">All Status</span>
            </label>

            <label className="flex items-center p-1 rounded-lg mb-0 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="status-filter"
                checked={tempSelectedStatus === 'Draft'}
                onChange={() => onTempStatusChange('Draft')}
                className="w-4 h-4 text-emerald-600"
              />
              <span className="text-sm text-gray-700 ml-2">Draft</span>
            </label>

            <label className="flex items-center p-1 rounded-lg mb-0 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="status-filter"
                checked={tempSelectedStatus === 'Published'}
                onChange={() => onTempStatusChange('Published')}
                className="w-4 h-4 text-emerald-600"
              />
              <span className="text-sm text-gray-700 ml-2">Published</span>
            </label>

            <label className="flex items-center p-1 rounded-lg mb-0 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="status-filter"
                checked={tempSelectedStatus === 'Archived'}
                onChange={() => onTempStatusChange('Archived')}
                className="w-4 h-4 text-emerald-600"
              />
              <span className="text-sm text-gray-700 ml-2">Archived</span>
            </label>
          </div>
        </div>

        {/* Availability Filter */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <h5 className="text-sm font-semibold text-gray-900 mb-1">Filter by Availability</h5>
          <div className="space-y-2">
            <label className="flex items-center p-1 rounded-lg mb-0 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="availability-filter"
                checked={tempSelectedAvailability === 'all'}
                onChange={() => onTempAvailabilityChange('all')}
                className="w-4 h-4 text-emerald-600"
              />
              <span className="text-sm text-gray-700 ml-2">All Items</span>
            </label>

            <label className="flex items-center p-1 rounded-lg mb-0 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="availability-filter"
                checked={tempSelectedAvailability === 'available'}
                onChange={() => onTempAvailabilityChange('available')}
                className="w-4 h-4 text-emerald-600"
              />
              <span className="text-sm text-gray-700 ml-2">Available</span>
            </label>

            <label className="flex items-center p-1 rounded-lg mb-0 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="availability-filter"
                checked={tempSelectedAvailability === 'unavailable'}
                onChange={() => onTempAvailabilityChange('unavailable')}
                className="w-4 h-4 text-emerald-600"
              />
              <span className="text-sm text-gray-700 ml-2">Unavailable</span>
            </label>
          </div>
        </div>

        {/* Chef Recommended Filter */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <label className="flex items-center p-1 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={tempSelectedChefRecommended}
              onChange={(e) => onTempChefRecommendedChange(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span className="text-sm text-gray-700 ml-2">Chef Recommended Only</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="mt-2 pt-2 border-t border-gray-100 px-4 flex gap-2">
          <button
            onClick={onResetFilters}
            className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onApplyFilters}
            className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
