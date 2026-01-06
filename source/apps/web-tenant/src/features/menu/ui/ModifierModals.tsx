/**
 * Menu Modifiers Feature - Modal Components
 * 
 * Modal components for modifier group CRUD operations
 */

import React from 'react';
import { X, Plus, AlertTriangle } from 'lucide-react';
import type { ModifierGroupFormData } from '../types';

// ModalMode for modifiers uses 'create' | 'edit'
type ModifierModalMode = 'create' | 'edit';

// ============================================================================
// MODIFIER GROUP MODAL (Create/Edit)
// ============================================================================

interface ModifierGroupModalProps {
  isOpen: boolean;
  mode: ModifierModalMode;
  formData: ModifierGroupFormData;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (data: Partial<ModifierGroupFormData>) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  // Option input state
  optionName: string;
  optionPrice: string;
  onOptionNameChange: (value: string) => void;
  onOptionPriceChange: (value: string) => void;
}

export function ModifierGroupModal({
  isOpen,
  mode,
  formData,
  onClose,
  onSave,
  onFormChange,
  onAddOption,
  onRemoveOption,
  optionName,
  optionPrice,
  onOptionNameChange,
  onOptionPriceChange,
}: ModifierGroupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Create Modifier Group' : 'Edit Modifier Group'}
          </h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange({ name: e.target.value })}
              placeholder="e.g. Size Options, Pizza Toppings"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormChange({ description: e.target.value })}
              placeholder="Brief description of this modifier group"
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Selection Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selection Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="single"
                  checked={formData.type === 'single'}
                  onChange={() => {
                    onFormChange({ 
                      type: 'single',
                      minChoices: 1,
                      maxChoices: 1,
                    });
                  }}
                  className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Single Choice</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Customer can select only one option
                  </div>
                </div>
              </label>

              <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="type"
                  value="multiple"
                  checked={formData.type === 'multiple'}
                  onChange={() => {
                    onFormChange({ 
                      type: 'multiple',
                      minChoices: 0,
                      maxChoices: formData.options.length || 10,
                    });
                  }}
                  className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Multiple Choice</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Customer can select multiple options
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900">Required</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Customer must select at least one option
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFormChange({ required: !formData.required })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.required ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  formData.required ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Min/Max Choices (for multiple type) */}
          {formData.type === 'multiple' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Choices
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.maxChoices}
                  value={formData.minChoices}
                  onChange={(e) => onFormChange({ minChoices: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Choices
                </label>
                <input
                  type="number"
                  min={formData.minChoices}
                  max={formData.options.length || 100}
                  value={formData.maxChoices}
                  onChange={(e) => onFormChange({ maxChoices: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Options Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Options <span className="text-red-500">*</span>
            </label>

            {/* Add Option Form */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={optionName}
                onChange={(e) => onOptionNameChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddOption();
                  }
                }}
                placeholder="Option name"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                value={optionPrice}
                onChange={(e) => onOptionPriceChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddOption();
                  }
                }}
                placeholder="Price delta"
                className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={onAddOption}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
              >
                Add
              </button>
            </div>

            {/* Options List */}
            {formData.options.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {formData.options.map((option, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{option.name}</div>
                      <div className="text-xs text-gray-500">
                        {option.priceDelta === 0 
                          ? 'Free'
                          : option.priceDelta > 0 
                            ? `+$${option.priceDelta.toFixed(2)}`
                            : `-$${Math.abs(option.priceDelta).toFixed(2)}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveOption(idx)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-gray-200 border-dashed rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">No options added yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
          >
            {mode === 'create' ? 'Create Group' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DELETE CONFIRMATION MODAL
// ============================================================================

interface DeleteConfirmModalProps {
  isOpen: boolean;
  groupName: string;
  linkedItems?: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  groupName,
  linkedItems = 0,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          {/* Icon */}
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Delete Modifier Group?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete <strong>&quot;{groupName}&quot;</strong>?
          </p>

          {linkedItems > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-sm text-amber-800">
                ⚠️ This group is used in <strong>{linkedItems}</strong> menu {linkedItems === 1 ? 'item' : 'items'}. 
                Deleting it will remove these associations.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
}
