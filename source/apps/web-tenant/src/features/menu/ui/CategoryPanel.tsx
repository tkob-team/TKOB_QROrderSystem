'use client';

import React from 'react';
import { Plus, MoreVertical } from './icons';

type CategoryPanelProps = {
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  sortedCategories: any[];
  getCategoryItemCount: (id: string) => number;
  categorySortBy: 'displayOrder' | 'name' | 'createdAt';
  setCategorySortBy: (by: 'displayOrder' | 'name' | 'createdAt') => void;
  menuItems: any[];
  onAddCategory: () => void;
  onCategoryContextMenu: (e: React.MouseEvent, categoryId: string) => void;
  onCategoryActionClick: (e: React.MouseEvent, categoryId: string) => void;
  contextMenuOpenCategoryId: string | null;
  showActiveOnlyCategories: boolean;
  setShowActiveOnlyCategories: (show: boolean) => void;
};

export function CategoryPanel({
  selectedCategory,
  setSelectedCategory,
  sortedCategories,
  getCategoryItemCount,
  categorySortBy,
  setCategorySortBy,
  menuItems,
  onAddCategory,
  onCategoryContextMenu,
  onCategoryActionClick,
  contextMenuOpenCategoryId,
  showActiveOnlyCategories,
  setShowActiveOnlyCategories,
}: CategoryPanelProps) {
  return (
    <div className="w-52 bg-white border-r border-gray-200 flex flex-col overflow-y-auto relative">
      <div className="px-3 py-2 border-b border-gray-200">
        <h3 className="text-gray-900 mb-3" style={{ fontSize: '16px', fontWeight: 700 }}>Categories</h3>
        <button
          onClick={onAddCategory}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
          style={{ fontSize: '14px', fontWeight: 600, borderRadius: '12px' }}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Sort Control */}
      <div className="px-3 py-2 border-b border-gray-200">
        <select
          value={categorySortBy}
          onChange={(e) => setCategorySortBy(e.target.value as 'displayOrder' | 'name' | 'createdAt')}
          className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500"
        >
          <option value="displayOrder">Sort by: Display Order</option>
          <option value="name">Sort by: Name</option>
          <option value="createdAt">Sort by: Creation Date</option>
        </select>
      </div>

      {/* Active Only Filter */}
      <div className="px-3 py-2 border-b border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showActiveOnlyCategories}
            onChange={(e) => setShowActiveOnlyCategories(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 cursor-pointer"
          />
          <span className="text-xs font-semibold text-gray-600">Active Only</span>
        </label>
      </div>

      <div className="flex-1 p-1" onClick={() => {}}>
        <div className="flex flex-col gap-1">
          {/* All Items */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center justify-between pl-3 pr-8 py-2.5 transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            style={{ 
              fontSize: '14px', 
              fontWeight: selectedCategory === 'all' ? 700 : 500,
              borderRadius: '12px',
              borderLeft: selectedCategory === 'all' ? '3px solid #10B981' : '3px solid transparent'
            }}
          >
            <span className="truncate">All Items</span>
            <span 
              className={`px-1.5 py-0.5 rounded-full shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              style={{ fontSize: '11px', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}
            >
              {menuItems.length}
            </span>
          </button>

          {/* Category List */}
          {sortedCategories.map((category: any) => {
            const count = getCategoryItemCount(category.id);
            const displayOrder = category.displayOrder ?? null;
            const isActive = category.active !== false;
            const isContextMenuOpen = contextMenuOpenCategoryId === category.id;

            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCategory(category.id);
                  }
                }}
                className={`relative flex flex-col gap-1 px-1 py-2 transition-all group cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${!isActive ? 'opacity-60' : ''}`}
                style={{ 
                  fontSize: '13px',
                  borderRadius: '12px',
                  borderLeft: selectedCategory === category.id ? '3px solid #10B981' : '3px solid transparent'
                }}
                onContextMenu={(e) => onCategoryContextMenu(e, category.id)}
                title={category.name}
              >
                {/* Row 1: Category name and count + More button */}
                <div className="flex items-center justify-between min-w-0">
                  {/* Category info */}
                  <div className="flex items-center w-full min-w-0 gap-2 text-left pl-2 pr-0.5 py-1.5 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-gray-400 shrink-0" style={{ fontSize: '11px', fontWeight: 500 }}>
                        {displayOrder !== null ? `#${displayOrder}` : '—'}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">{category.name}</span>
                    </div>
                    <span 
                      className={`px-1.5 py-0.5 rounded-full shrink-0 ml-auto ${
                        selectedCategory === category.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      style={{ fontSize: '11px', fontWeight: 700, minWidth: '22px', textAlign: 'center' }}
                    >
                      {count}
                    </span>
                  </div>

                  {/* More actions button */}
                  <button
                    onClick={(e) => onCategoryActionClick(e, category.id)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-200 rounded shrink-0 ${
                      selectedCategory === category.id ? 'opacity-100 bg-emerald-100 hover:bg-emerald-200' : ''
                    }`}
                    title="More actions"
                  >
                    <MoreVertical size={16} className="text-gray-600" />
                  </button>
                </div>

                {/* Row 2: Status Badge - Only show Inactive */}
                {!isActive && (
                  <div className="flex items-center gap-1 px-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0 bg-gray-100 text-gray-600">
                      Inactive
                    </span>
                    <span className="text-xs text-gray-500 ml-1">May be hidden</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
