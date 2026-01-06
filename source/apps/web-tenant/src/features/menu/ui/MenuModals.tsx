/**
 * Menu Management Feature - Menu Item Modal
 * 
 * Modal component for creating and editing menu items
 */

import React from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { DIETARY_TAG_OPTIONS } from '../constants';
import type { MenuItemFormData, ModalMode, Category, ModifierGroup, DietaryTag } from '../types';

// ============================================================================
// MENU ITEM MODAL
// ============================================================================

interface MenuItemModalProps {
  isOpen: boolean;
  mode: ModalMode;
  formData: MenuItemFormData;
  categories: Category[];
  modifierGroups: ModifierGroup[];
  onClose: () => void;
  onSave: () => void;
  onFormChange: (data: MenuItemFormData) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSaving?: boolean;
}

export function MenuItemModal({
  isOpen,
  mode,
  formData,
  categories,
  modifierGroups,
  onClose,
  onSave,
  onFormChange,
  onImageUpload,
  isSaving,
}: MenuItemModalProps) {
  if (!isOpen) return null;

  const toggleDietary = (tag: DietaryTag) => {
    const newDietary = formData.dietary.includes(tag)
      ? formData.dietary.filter((t) => t !== tag)
      : [...formData.dietary, tag];
    onFormChange({ ...formData, dietary: newDietary });
  };

  const toggleModifierGroup = (groupId: string) => {
    const currentIds = formData.modifierGroupIds || [];
    const newIds = currentIds.includes(groupId)
      ? currentIds.filter((id) => id !== groupId)
      : [...currentIds, groupId];
    onFormChange({ ...formData, modifierGroupIds: newIds });
  };

  const isValid = formData.name.trim() && formData.price.trim() && formData.category;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full mx-4 rounded-lg shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: '560px', maxHeight: 'calc(100vh - 80px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Item Image</label>

            {formData.image ? (
              <div className="border-2 border-emerald-500 rounded-lg p-6 flex flex-col items-center gap-3 bg-emerald-50">
                <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-emerald-700">{formData.image.name}</p>
                <p className="text-xs text-emerald-600">
                  {(formData.image.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() => onFormChange({ ...formData, image: null })}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-500">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  Drop image or click to upload
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or WEBP (max. 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Item Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="e.g., Caesar Salad"
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              placeholder="Describe your dish..."
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-emerald-500"
              rows={3}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">
                $
              </span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => onFormChange({ ...formData, price: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Status *</label>
            <select
              value={formData.status}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  status: e.target.value as 'available' | 'unavailable' | 'sold_out',
                })
              }
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>

          {/* Dietary Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAG_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleDietary(option.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                    formData.dietary.includes(option.value)
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chef's Recommendation */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                Mark as Chef&apos;s recommendation
              </span>
              <span className="text-xs text-gray-500">Highlight this item to customers</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.chefRecommended}
                onChange={(e) =>
                  onFormChange({ ...formData, chefRecommended: e.target.checked })
                }
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  formData.chefRecommended ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                    formData.chefRecommended ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Modifier Groups */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Modifier Groups (Optional)
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
              {modifierGroups.filter((g) => (g as any).active).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No active modifier groups
                </p>
              ) : (
                <div className="space-y-2">
                  {modifierGroups
                    .filter((g) => (g as any).active)
                    .map((group: any) => (
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
                          <span className="ml-2 text-xs text-gray-500">
                            ({group.type === 'single' ? 'Single' : 'Multiple'})
                          </span>
                        </div>
                      </label>
                    ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Select modifier groups for this item (e.g., Size, Toppings, Extras)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!isValid || isSaving}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : mode === 'add' ? 'Add Item' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADD CATEGORY MODAL
// ============================================================================

interface AddCategoryModalProps {
  isOpen: boolean;
  name: string;
  description: string;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  isSaving?: boolean;
}

export function AddCategoryModal({
  isOpen,
  name,
  description,
  onClose,
  onSave,
  onNameChange,
  onDescriptionChange,
  isSaving,
}: AddCategoryModalProps) {
  if (!isOpen) return null;

  const isValid = name.trim();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Add Category</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Appetizers"
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Description</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Optional description..."
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-emerald-500"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!isValid || isSaving}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DELETE CONFIRM MODAL
// ============================================================================

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  itemName,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Delete Menu Item?</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{itemName}</span> will be removed from
            your menu.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
