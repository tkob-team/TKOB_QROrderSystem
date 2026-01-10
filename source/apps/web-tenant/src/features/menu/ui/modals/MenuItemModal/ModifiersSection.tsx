import React from 'react';
import type { MenuItemFormData } from '../../../model/types';
import type { ModifierGroup } from '../../../model/modifiers';

interface ModifiersSectionProps {
  modifierGroups: ModifierGroup[];
  formData: MenuItemFormData;
  onFormChange: (data: MenuItemFormData) => void;
}

export function ModifiersSection({ modifierGroups, formData, onFormChange }: ModifiersSectionProps) {
  const toggleModifierGroup = (groupId: string) => {
    const currentIds = formData.modifierGroupIds || [];
    const newIds = currentIds.includes(groupId)
      ? currentIds.filter((id) => id !== groupId)
      : [...currentIds, groupId];
    onFormChange({ ...formData, modifierGroupIds: newIds });
  };

  const activeGroups = modifierGroups.filter((group) => group.active);

  const resolveTypeLabel = (type: ModifierGroup['type']) =>
    type === 'single' || type === 'SINGLE_CHOICE' ? 'Single' : 'Multiple';

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-3">Modifier Groups (Optional)</label>
      <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
        {activeGroups.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No active modifier groups</p>
        ) : (
          <div className="space-y-2">
            {activeGroups.map((group) => (
              <label
                key={group.id}
                className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(formData.modifierGroupIds || []).includes(group.id)}
                  onChange={() => toggleModifierGroup(group.id)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{group.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({resolveTypeLabel(group.type)})</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500">Select modifier groups for this item (e.g., Size, Toppings, Extras)</p>
    </div>
  );
}
