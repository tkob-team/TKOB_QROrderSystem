'use client';

import React from 'react';
import { Card, Badge } from '@/shared/components/ui';
import { Plus, Search, Edit, Trash2, Layers } from 'lucide-react';
import { CURRENCY_CONFIG } from '@/config/currency';
import { ModifierGroup } from '../types/modifiers';

type ModifiersGridProps = {
  groups: ModifierGroup[];
  normalizeType: (type: string) => 'single' | 'multiple';
  onEditGroup: (group: ModifierGroup) => void;
  onDeleteGroup: (group: ModifierGroup) => void;
  onNewGroup: () => void;
  searchQuery: string;
  selectedType: 'all' | 'single' | 'multiple';
};

export function ModifiersGrid({
  groups,
  normalizeType,
  onEditGroup,
  onDeleteGroup,
  onNewGroup,
  searchQuery,
  selectedType,
}: ModifiersGridProps) {
  if (groups.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="p-4 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-emerald-300 flex flex-col h-full"
          >
            <div className="mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4
                    className="text-gray-900"
                    style={{ fontSize: '17px', fontWeight: 700 }}
                  >
                    {group.name}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={
                        normalizeType(group.type) === 'single'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {normalizeType(group.type) === 'single'
                        ? 'Choose 1'
                        : 'Multi-select'}
                    </Badge>
                    {group.required && (
                      <Badge variant="warning">Required</Badge>
                    )}
                    {group.active === false && (
                      <Badge variant="neutral">Inactive</Badge>
                    )}
                  </div>
                </div>
                {/* Display Order Badge - Top Right */}
                {group.displayOrder !== undefined && (
                  <div
                    className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full tooltip"
                    title="Controls the display order of this modifier group"
                    style={{
                      backgroundColor: '#eff6ff',
                      borderColor: '#bfdbfe',
                      minWidth: 'fit-content',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span
                      className="text-blue-700 font-semibold"
                      style={{ fontSize: '12px' }}
                    >
                      Order #{group.displayOrder}
                    </span>
                  </div>
                )}
              </div>
              {group.description && (
                <p
                  className="text-gray-600 line-clamp-2"
                  style={{ fontSize: '13px', lineHeight: '1.5', minHeight: '3rem' }}
                >
                  {group.description}
                </p>
              )}
              {!group.description && (
                <div style={{ minHeight: '3rem' }} />
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 mb-2 pb-2 border-b-2 border-gray-100">
              <div className="flex items-center gap-2">
                <span
                  className="text-gray-600"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                >
                  Options:
                </span>
                <span
                  className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full"
                  style={{ fontSize: '11px', fontWeight: 700 }}
                >
                  {group.options.length}
                </span>
              </div>
              {/* <div className="flex items-center gap-2">
                <span
                  className="text-gray-600"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                >
                  Items:
                </span>
                <span
                  className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-full"
                  style={{ fontSize: '11px', fontWeight: 700 }}
                >
                  {group.linkedItems ?? 0}
                </span>
              </div> */}
            </div>

            {/* Sample Options Preview */}
            <div className="">
              <div
                className="text-gray-700 mb-2"
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                Options Preview
              </div>
              <div className="flex flex-col gap-1">
                {group.options.slice(0, 3).map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between text-gray-600"
                    style={{ fontSize: '12px' }}
                  >
                    <span>{option.name}</span>
                    <span
                      className="text-emerald-600"
                      style={{ fontWeight: 600 }}
                    >
                      {option.priceDelta >= 0 ? '+' : ''}
                      {CURRENCY_CONFIG.format(option.priceDelta)}
                    </span>
                  </div>
                ))}
                {group.options.length > 3 && (
                  <span
                    className="text-gray-500"
                    style={{ fontSize: '11px' }}
                  >
                    +{group.options.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onEditGroup(group)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all border border-emerald-200 hover:border-emerald-300"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDeleteGroup(group)}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-red-50 rounded-xl transition-all border border-gray-200 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No groups found
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        {searchQuery || selectedType !== 'all'
          ? 'Try adjusting your filters or search query'
          : 'Get started by creating your first modifier group'}
      </p>
      {!searchQuery && selectedType === 'all' && (
        <button
          onClick={onNewGroup}
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Group
        </button>
      )}
    </div>
  );
}
