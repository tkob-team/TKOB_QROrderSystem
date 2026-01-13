'use client';

import React from 'react';
import { X } from 'lucide-react';
import { CURRENCY_CONFIG } from '@/shared/config';

interface FormOption {
  name: string;
  priceDelta: number;
  displayOrder: number;
  active: boolean;
}

type ModifierGroupModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formName: string;
  onNameChange: (name: string) => void;
  formDescription: string;
  onDescriptionChange: (description: string) => void;
  formDisplayOrder: number;
  onDisplayOrderChange: (order: number) => void;
  formType: 'single' | 'multiple';
  onTypeChange: (type: 'single' | 'multiple') => void;
  formRequired: boolean;
  onRequiredChange: (required: boolean) => void;
  formMinChoices: number;
  onMinChoicesChange: (min: number) => void;
  formMaxChoices: number;
  onMaxChoicesChange: (max: number) => void;
  formActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  formOptions: FormOption[];
  optionName: string;
  onOptionNameChange: (name: string) => void;
  optionPrice: string;
  onOptionPriceChange: (price: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ModifierGroupModal({
  isOpen,
  mode,
  formName,
  onNameChange,
  formDescription,
  onDescriptionChange,
  formDisplayOrder,
  onDisplayOrderChange,
  formType,
  onTypeChange,
  formRequired,
  onRequiredChange,
  formMinChoices,
  onMinChoicesChange,
  formMaxChoices,
  onMaxChoicesChange,
  formActive,
  onActiveChange,
  formOptions,
  optionName,
  onOptionNameChange,
  optionPrice,
  onOptionPriceChange,
  onAddOption,
  onRemoveOption,
  onClose,
  onSubmit,
}: ModifierGroupModalProps) {
  if (!isOpen) return null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddOption();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] animate-scaleIn flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl shrink-0 z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Create Modifier Group' : 'Edit Modifier Group'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Group Name */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Size Options, Pizza Toppings"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Brief description of this modifier group"
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order (optional)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formDisplayOrder ?? 0}
              onChange={(e) => onDisplayOrderChange(parseInt(e.target.value) || 0)}
              placeholder="e.g., 0"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Selection Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selection Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`type-${mode}`}
                  value="single"
                  checked={formType === 'single'}
                  onChange={() => onTypeChange('single')}
                  className="mt-0.5 w-4 h-4 text-emerald-600"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Single Choice</div>
                  <div className="text-xs text-gray-500">
                    Customer can select only one option
                  </div>
                </div>
              </label>

              <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`type-${mode}`}
                  value="multiple"
                  checked={formType === 'multiple'}
                  onChange={() => onTypeChange('multiple')}
                  className="mt-0.5 w-4 h-4 text-emerald-600"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    Multiple Choice
                  </div>
                  <div className="text-xs text-gray-500">
                    Customer can select multiple options
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Required & Min/Max Choices */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formRequired}
                onChange={(e) => onRequiredChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Required</div>
                <div className="text-xs text-gray-500">
                  Customer must select from this group
                </div>
              </div>
            </label>

            {/* Active Status - Only in Edit Mode */}
            {mode === 'edit' && onActiveChange && (
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formActive ?? true}
                  onChange={(e) => onActiveChange(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Active</div>
                  <div className="text-xs text-gray-500">
                    This modifier group is available for selection
                  </div>
                </div>
              </label>
            )}

            {formType === 'multiple' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Choices
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinChoices}
                    onChange={(e) => onMinChoicesChange(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Choices
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMaxChoices}
                    onChange={(e) => onMaxChoicesChange(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Options Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Options <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">
                (e.g., Small, Medium, Large)
              </span>
            </label>

            {/* Add Option Form */}
            <div className="space-y-2 mb-3">
              <input
                type="text"
                value={optionName}
                onChange={(e) => onOptionNameChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Option name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={optionPrice}
                  onChange={(e) => onOptionPriceChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Price (${CURRENCY_CONFIG.code})`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={onAddOption}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Options List - Scrollable */}
            {formOptions.length > 0 ? (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                {formOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      option.active
                        ? 'bg-gray-50 border border-gray-200'
                        : 'bg-gray-100 border border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {option.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {option.priceDelta >= 0 ? '+' : ''}
                        {CURRENCY_CONFIG.format(option.priceDelta)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveOption(idx)}
                      className="ml-3 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-all whitespace-nowrap flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-gray-200 border-dashed rounded-lg">
                <p className="text-sm text-gray-500">No options added yet</p>
              </div>
            )}
          </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200 rounded-b-2xl shrink-0 z-10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {mode === 'create' ? 'Create Group' : 'Update Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
