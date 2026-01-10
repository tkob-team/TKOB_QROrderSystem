import React from 'react';
import { Plus, Search } from 'lucide-react';
import { Select } from '@/shared/components';
import { SORT_OPTIONS } from '../../constants';
import type { MenuFilters, SortOption } from '../../model/types';
import { MenuItemFilterDropdown } from './MenuItemFilterDropdown';

interface MenuToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
  isFilterDropdownOpen: boolean;
  appliedFilters: MenuFilters;
  tempFilters: MenuFilters;
  onFilterDropdownToggle: () => void;
  onTempFilterChange: (filters: Partial<MenuFilters>) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onCloseFilterDropdown: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onAddItem: () => void;
  categories?: Array<{ id: string; name: string }>;
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  onAddCategory?: () => void;
}

export function MenuToolbar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isFilterDropdownOpen,
  appliedFilters,
  tempFilters,
  onFilterDropdownToggle,
  onTempFilterChange,
  onApplyFilters,
  onResetFilters,
  onCloseFilterDropdown,
  sortOption,
  onSortChange,
  onAddItem,
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
}: MenuToolbarProps) {
  return (
    <div className="bg-secondary border-b border-default px-4 lg:px-6 py-4">
      {categories && onSelectCategory && (
        <div className="lg:hidden mb-4 flex gap-2">
          <select
            value={selectedCategory || 'all'}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-elevated border border-default rounded-lg text-sm font-medium text-text-primary cursor-pointer transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {onAddCategory && (
            <button
              onClick={onAddCategory}
              className="px-3 py-2.5 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] text-white rounded-lg transition-all"
              aria-label="Add category"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearchSubmit) {
                  onSearchSubmit();
                }
              }}
              placeholder="Search menu items... (Auto-search)"
              className="w-full pl-10 pr-4 py-2.5 bg-elevated border border-default rounded-lg text-sm text-text-primary placeholder:text-text-tertiary transition-all hover:border-hover focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <MenuItemFilterDropdown
            isOpen={isFilterDropdownOpen}
            appliedFilters={appliedFilters}
            tempFilters={tempFilters}
            onTempFilterChange={onTempFilterChange}
            onApplyFilters={onApplyFilters}
            onResetFilters={onResetFilters}
            onClose={onCloseFilterDropdown}
            onToggle={onFilterDropdownToggle}
          />

          <div className="hidden sm:block">
            <Select
              options={SORT_OPTIONS.map((option) => ({ value: option, label: option }))}
              value={sortOption}
              onChange={(value) => onSortChange(value as SortOption)}
              size="md"
              triggerClassName="min-w-[180px]"
            />
          </div>

          <button
            onClick={onAddItem}
            className="h-10 px-3 lg:px-4 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-600))] hover:-translate-y-0.5 active:translate-y-0 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>
    </div>
  );
}
