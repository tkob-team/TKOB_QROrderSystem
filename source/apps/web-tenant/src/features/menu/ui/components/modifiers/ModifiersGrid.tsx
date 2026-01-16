'use client';

import React from 'react';
import { Plus, Search, Edit, Trash2, Settings } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import type { ModifierOption } from '../../../model/modifiers';
import { MODIFIER_TYPE_CONFIG } from '../../../constants';

type ModifiersGridProps = {
  groups: any[]; // Backend response type
  onEdit: (group: any) => void;
  onDelete: (group: any) => void;
  onCreateGroup: () => void;
  isLoading?: boolean;
  searchQuery?: string;
};

interface ModifierGroupCardProps {
  group: any; // Backend response type
  onEdit: (group: any) => void;
  onDelete: (group: any) => void;
}

function normalizeType(type: string): 'single' | 'multiple' {
  return String(type) === 'SINGLE_CHOICE' || type === 'single' ? 'single' : 'multiple';
}

function ModifierGroupCard({ group, onEdit, onDelete }: ModifierGroupCardProps) {
  const displayType = normalizeType(group.type);
  const typeConfig = MODIFIER_TYPE_CONFIG[displayType];

  return (
    <Card className="p-0 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
      {/* Header with actions */}
      <div className="p-5 bg-gradient-to-br from-elevated to-primary border-b border-default">
        {/* Name and buttons row */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold text-text-primary">{group.name}</h4>
          <div className="flex gap-2 flex-shrink-0">
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

        {/* Description - full width */}
        {group.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">{group.description}</p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={typeConfig.badgeColor}>
            {typeConfig.label}
          </Badge>
          {group.required && (
            <Badge variant="error">Required</Badge>
          )}
          {group.displayOrder !== undefined && (
            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-purple-50 text-purple-600 border border-purple-200">
              Order #{group.displayOrder}
            </span>
          )}
          {group.active === false && (
            <Badge variant="default">Archived</Badge>
          )}
        </div>
      </div>

      {/* Options list - flex-1 to push footer down */}
      <div className="p-5 flex-1 flex flex-col">
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
            {group.options.map((option: ModifierOption) => {
              const priceDelta = Number(option.priceDelta) || 0;
              return (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-3 bg-elevated rounded-lg"
                >
                  <span className="text-sm font-medium text-text-primary">{option.name}</span>
                  <span className="text-sm text-text-secondary">
                    {priceDelta === 0
                      ? 'Free'
                      : priceDelta > 0
                        ? `+$${priceDelta.toFixed(2)}`
                        : `-$${Math.abs(priceDelta).toFixed(2)}`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary text-center py-4">No options added yet</p>
        )}
      </div>
    </Card>
  );
}

export function ModifiersGrid({
  groups,
  onEdit,
  onDelete,
  onCreateGroup,
  isLoading,
  searchQuery,
}: ModifiersGridProps) {
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
