import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useCategoryModalController } from '../../hooks';

interface CategoryModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  categoryId?: string;
  name: string;
  description: string;
  displayOrder: string;
  active: boolean;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onDisplayOrderChange: (displayOrder: string) => void;
  onActiveChange: (active: boolean) => void;
  isSaving?: boolean;
}

export function CategoryModal({
  isOpen,
  mode,
  categoryId,
  name,
  description,
  displayOrder,
  active,
  onClose,
  onSave,
  onNameChange,
  onDescriptionChange,
  onDisplayOrderChange,
  onActiveChange,
  isSaving,
}: CategoryModalProps) {
  const { data: freshCategoryData } = useCategoryModalController({
    categoryId,
    isOpen,
    mode,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && freshCategoryData) {
      onNameChange(freshCategoryData.name);
      onDescriptionChange(freshCategoryData.description || '');
      onDisplayOrderChange(String(freshCategoryData.displayOrder || ''));
      onActiveChange(freshCategoryData.active);
    }
  }, [isOpen, mode, freshCategoryData, onNameChange, onDescriptionChange, onDisplayOrderChange, onActiveChange]);

  const isValid = name.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Add Category' : 'Edit Category'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                const finalValue = Number.isNaN(value) ? '0' : Math.max(0, value).toString();
                onDisplayOrderChange(finalValue);
              }}
              placeholder="0"
              min="0"
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500">Lower numbers appear first in the list</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={active}
                  onChange={() => onActiveChange(true)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!active}
                  onChange={() => onActiveChange(false)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>
        </div>

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
            {isSaving ? (mode === 'add' ? 'Creating...' : 'Updating...') : mode === 'add' ? 'Create Category' : 'Update Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

export const AddCategoryModal = CategoryModal;
