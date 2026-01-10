import React from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import type { MenuFilters } from '../../model/types';

interface MenuItemFilterDropdownProps {
  isOpen: boolean;
  appliedFilters: MenuFilters;
  tempFilters: MenuFilters;
  onTempFilterChange: (filters: Partial<MenuFilters>) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export function MenuItemFilterDropdown({
  isOpen,
  appliedFilters: _appliedFilters,
  tempFilters,
  onTempFilterChange,
  onApplyFilters,
  onResetFilters,
  onClose,
  onToggle,
}: MenuItemFilterDropdownProps) {
  const handleApply = () => {
    onApplyFilters();
  };

  const handleReset = () => {
    onResetFilters();
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="px-4 py-2.5 bg-white border border-[rgb(var(--border))] rounded-lg text-sm font-medium text-text-primary hover:border-[rgb(var(--primary-400))] transition-all flex items-center gap-2"
      >
        <span>Filter</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-[rgb(var(--border))] z-50 animate-in fade-in-0 zoom-in-95 duration-150 max-h-[480px] overflow-y-auto">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 sticky top-0 bg-white">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div>
                <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1.5">Status</p>
                <div className="space-y-1">
                  {['All Status', 'Draft', 'Published', 'Archived'].map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 cursor-pointer group/radio px-2 py-1 rounded-lg hover:bg-[rgb(var(--primary-50))] transition-colors"
                      onClick={() => onTempFilterChange({ status: option })}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          tempFilters.status === option
                            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]'
                            : 'border-gray-300'
                        }`}
                      >
                        {tempFilters.status === option && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1.5">Availability</p>
                <div className="space-y-1">
                  {[
                    { value: 'all', label: 'All Items' },
                    { value: 'available', label: 'Available' },
                    { value: 'unavailable', label: 'Unavailable' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 cursor-pointer group/radio px-2 py-1 rounded-lg hover:bg-[rgb(var(--primary-50))] transition-colors"
                      onClick={() =>
                        onTempFilterChange({ availability: option.value as 'all' | 'available' | 'unavailable' })
                      }
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          tempFilters.availability === option.value
                            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]'
                            : 'border-gray-300'
                        }`}
                      >
                        {tempFilters.availability === option.value && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pb-3">
                <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1.5">Special</p>
                <label className="flex items-center gap-3 cursor-pointer px-2 py-1 rounded-lg hover:bg-[rgb(var(--primary-50))] transition-colors">
                  <input
                    type="checkbox"
                    checked={tempFilters.chefRecommended || false}
                    onChange={(e) => onTempFilterChange({ chefRecommended: e.target.checked })}
                    className="w-5 h-5 text-[rgb(var(--primary))] rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-text-primary">Chef Recommended Only</span>
                </label>
              </div>

              <div className="flex gap-2 pt-1.5 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  onClick={handleReset}
                  className="flex-1 h-10 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 h-10 px-4 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
