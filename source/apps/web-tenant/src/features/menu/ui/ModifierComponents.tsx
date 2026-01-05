/**
 * Menu Modifiers Feature - UI Components
 * 
 * Colocated components for modifier groups management
 */

import React from 'react';
import { Plus, Search, Filter, XCircle, X, Edit, Trash2, Settings } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import type { ModifierGroup, ModifierFilters, ModifierOption } from '../types';
import { MODIFIER_TYPE_CONFIG, TYPE_FILTER_OPTIONS, MODIFIER_STATUS_FILTER_OPTIONS } from '../constants';

// ============================================================================
// MODIFIER TOOLBAR
// ============================================================================

interface ModifierToolbarProps {
  searchQuery: string;
  selectedType: 'all' | 'single' | 'multiple';
  selectedStatus: 'all' | 'archived';
  tempSelectedType: 'all' | 'single' | 'multiple';
  tempSelectedStatus: 'all' | 'archived';
  showFilterDropdown: boolean;
  totalGroups: number;
  singleCount: number;
  multiCount: number;
  activeCount: number;
  archivedCount: number;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void; // Trigger filter on Enter
  onTypeChange: (type: 'all' | 'single' | 'multiple') => void;
  onStatusChange: (status: 'all' | 'archived') => void;
  onTempTypeChange: (type: 'all' | 'single' | 'multiple') => void;
  onTempStatusChange: (status: 'all' | 'archived') => void;
  onApplyFilters: () => void;
  onToggleFilterDropdown: () => void;
  onClearFilters: () => void;
  onCreateGroup: () => void;
}

export function ModifierToolbar({
  searchQuery,
  selectedType,
  selectedStatus,
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
  onTempTypeChange,
  onTempStatusChange,
  onApplyFilters,
  onToggleFilterDropdown,
  onClearFilters,
  onCreateGroup,
}: ModifierToolbarProps) {
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

        {/* Clear filter button */}
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

// ============================================================================
// MODIFIER GROUP CARD
// ============================================================================

interface ModifierGroupCardProps {
  group: any; // Backend response type
  onEdit: (group: any) => void;
  onDelete: (group: any) => void;
}

export function ModifierGroupCard({ group, onEdit, onDelete }: ModifierGroupCardProps) {
  // Map backend type to frontend
  const displayType = String(group.type) === 'SINGLE_CHOICE' || group.type === 'single' 
    ? 'single' 
    : 'multiple';
  const typeConfig = MODIFIER_TYPE_CONFIG[displayType];

  return (
    <Card className="p-0 overflow-hidden hover:shadow-lg transition-all">
      {/* Header with actions */}
      <div className="p-5 bg-gradient-to-br from-elevated to-primary border-b border-default">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-text-primary mb-1">{group.name}</h4>
            {group.description && (
              <p className="text-sm text-text-secondary line-clamp-2">{group.description}</p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(group);
              }}
              className="w-9 h-9 bg-primary hover:bg-accent-50 rounded-lg flex items-center justify-center border border-default"
            >
              <Edit className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(group);
              }}
              className="w-9 h-9 bg-primary hover:bg-red-50 rounded-lg flex items-center justify-center border border-default"
            >
              <Trash2 className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={typeConfig.badgeColor}>
            {typeConfig.label}
          </Badge>
          {group.required && (
            <Badge variant="error">Required</Badge>
          )}
          {!group.active && (
            <Badge variant="neutral">Archived</Badge>
          )}
        </div>
      </div>

      {/* Options list */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold text-text-secondary">Options ({group.options?.length || 0})</h5>
          {displayType === 'multiple' && (
            <span className="text-xs text-text-tertiary">
              Min: {group.minChoices} | Max: {group.maxChoices}
            </span>
          )}
        </div>

        {group.options && group.options.length > 0 ? (
          <div className="space-y-2">
            {group.options.map((option: ModifierOption) => (
              <div
                key={option.id}
                className="flex items-center justify-between p-3 bg-elevated rounded-lg"
              >
                <span className="text-sm font-medium text-text-primary">{option.name}</span>
                <span className="text-sm text-text-secondary">
                  {option.priceDelta === 0 
                    ? 'Free' 
                    : option.priceDelta > 0 
                      ? `+$${option.priceDelta.toFixed(2)}` 
                      : `-$${Math.abs(option.priceDelta).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary text-center py-4">No options added yet</p>
        )}
      </div>

      {/* Footer - linked items */}
      {group.linkedItems !== undefined && (
        <div className="px-5 py-3 bg-elevated border-t border-default">
          <span className="text-xs text-text-secondary">
            Used in {group.linkedItems} {group.linkedItems === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// MODIFIER GROUP GRID
// ============================================================================

interface ModifierGroupGridProps {
  groups: any[]; // Backend response type
  onEdit: (group: any) => void;
  onDelete: (group: any) => void;
  onCreateGroup: () => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export function ModifierGroupGrid({
  groups,
  onEdit,
  onDelete,
  onCreateGroup,
  isLoading,
  searchQuery,
}: ModifierGroupGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-5 animate-pulse">
            <div className="h-6 bg-secondary rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-secondary rounded w-full mb-2"></div>
            <div className="h-4 bg-secondary rounded w-5/6 mb-4"></div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-secondary rounded w-20"></div>
              <div className="h-6 bg-secondary rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-10 bg-secondary rounded"></div>
              <div className="h-10 bg-secondary rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state - no groups at all
  if (groups.length === 0 && !searchQuery) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Settings className="w-16 h-16 text-text-tertiary mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No modifier groups yet
          </h3>
          <p className="text-text-secondary mb-6">
            Create your first modifier group to add options like sizes, toppings, or extras to your menu items.
          </p>
          <button
            onClick={onCreateGroup}
            className="flex items-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Modifier Group</span>
          </button>
        </div>
      </Card>
    );
  }

  // Empty state - no search results
  if (groups.length === 0 && searchQuery) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Search className="w-16 h-16 text-text-tertiary mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No groups found for &quot;{searchQuery}&quot;
          </h3>
          <p className="text-text-secondary">
            Try different keywords or check your spelling.
          </p>
        </div>
      </Card>
    );
  }

  // Grid with groups
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <ModifierGroupCard
          key={group.id}
          group={group}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
