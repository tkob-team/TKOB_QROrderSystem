'use client';

import React from 'react';
import { Upload, X } from '../icons';
import { MAX_FILE_SIZE_MB } from '../../utils/imageUpload';
import type { ItemFormData } from '../../hooks/useMenuManagementPage';
import type { PhotoState } from '../../hooks/useMenuItemPhotoManager';

type MenuItemModalProps = {
  isOpen: boolean;
  mode: 'add' | 'edit';
  formData: ItemFormData;
  onFormDataChange: (data: Partial<ItemFormData>) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  categories: any[];
  modifierGroups: any[];
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (localId: string) => void;
  onSetPhotoPrimary: (localId: string) => void;
  toggleDietary: (tag: string) => void;
  // Photo manager state
  photos: PhotoState[];
  isSaving: boolean;
  saveProgress: string | null;
};

export function MenuItemModal({
  isOpen,
  mode,
  formData,
  onFormDataChange,
  onClose,
  onSave,
  categories,
  modifierGroups,
  onFileInputChange,
  onRemovePhoto,
  onSetPhotoPrimary,
  toggleDietary,
  photos,
  isSaving,
  saveProgress,
}: MenuItemModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white w-full mx-4 rounded-xl overflow-hidden flex flex-col"
        style={{ maxWidth: '560px', maxHeight: 'calc(100vh - 80px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Image Upload - Multiple Files */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Item Photos</label>
            {mode === 'add' && (
              <p className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                💡 Photos will be uploaded after the item is created
              </p>
            )}

            {photos.length > 0 ? (
              <div className="space-y-3">
                {photos.map((photo) => (
                  <div
                    key={photo.localId}
                    className="border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-4 bg-emerald-50"
                  >
                    <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={photo.previewUrl || photo.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-700 truncate">
                        {photo.file?.name || 'Uploaded'}
                      </p>
                      <p className="text-xs text-emerald-600">
                        {photo.file ? `${(photo.file.size / 1024).toFixed(1)} KB` : 'Server image'}
                      </p>
                      {photo.isPrimary && (
                        <span className="inline-block mt-1 px-2 py-1 bg-emerald-600 text-white text-xs font-semibold rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!photo.isPrimary && (
                        <button
                          type="button"
                          onClick={() => onSetPhotoPrimary(photo.localId)}
                          className="px-3 py-1 text-xs font-medium text-emerald-700 bg-white border border-emerald-500 rounded hover:bg-emerald-50"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemovePhoto(photo.localId)}
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {/* Add more photos button */}
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-emerald-500 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-600">Add more photos</p>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={onFileInputChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-500 transition-colors">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Drop photos or click to upload</p>
                <p className="text-xs text-gray-500">PNG, JPG or WEBP (max. {MAX_FILE_SIZE_MB}MB per image)</p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={onFileInputChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              placeholder="e.g., Caesar Salad"
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => onFormDataChange({ category: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            >
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              placeholder="Describe your dish..."
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">$</span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => onFormDataChange({ price: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Preparation time (minutes) <span className="text-gray-500 font-normal">(optional)</span></label>
            <input
              type="number"
              value={formData.prepTimeMinutes ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  onFormDataChange({ prepTimeMinutes: null });
                } else {
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 240) {
                    onFormDataChange({ prepTimeMinutes: numValue });
                  }
                }
              }}
              placeholder="e.g., 15"
              min="0"
              max="240"
              step="1"
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
            {formData.prepTimeMinutes !== null && formData.prepTimeMinutes > 240 && (
              <p className="text-xs text-red-600">Preparation time must not exceed 240 minutes</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Display Order <span className="text-gray-500 font-normal">(optional)</span></label>
            <input
              type="number"
              value={formData.displayOrder ?? 0}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                  onFormDataChange({ displayOrder: value });
                }
              }}
              placeholder="e.g., 1"
              min="0"
              step="1"
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {mode === 'edit' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => onFormDataChange({ status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' })}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">Available</span>
              <span className="text-xs text-gray-500">Make this item available for order</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => onFormDataChange({ available: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full relative transition-colors ${
                formData.available ? 'bg-emerald-500' : 'bg-gray-200'
              }`}>
                <div className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                  formData.available ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Dietary Tags</label>
            <div className="flex gap-2">
              {['vegan', 'vegetarian', 'spicy'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleDietary(tag)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize ${
                    formData.dietary.includes(tag)
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Allergens</label>
            <div className="flex flex-wrap gap-2">
              {['dairy', 'gluten', 'eggs', 'fish', 'shellfish', 'peanuts', 'tree nuts', 'soy', 'sesame'].map((allergen) => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => {
                    const updated = formData.allergens.includes(allergen)
                      ? formData.allergens.filter(a => a !== allergen)
                      : [...formData.allergens, allergen];
                    onFormDataChange({ allergens: updated });
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize ${
                    formData.allergens.includes(allergen)
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">Mark as Chef&apos;s recommendation</span>
              <span className="text-xs text-gray-500">Highlight this item to customers</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.chefRecommended}
                onChange={(e) => onFormDataChange({ chefRecommended: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full relative transition-colors ${
                formData.chefRecommended ? 'bg-emerald-500' : 'bg-gray-200'
              }`}>
                <div className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                  formData.chefRecommended ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </label>
          </div>

          {/* Modifier Groups Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Modifier Groups (Optional)
            </label>
            <div className="border border-gray-300 rounded-xl p-3 max-h-48 overflow-y-auto bg-gray-50">
              {modifierGroups.filter((g: any) => g.active).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No active modifier groups</p>
              ) : (
                <div className="space-y-2">
                  {modifierGroups.filter((g: any) => g.active).map((group: any) => (
                    <label
                      key={group.id}
                      className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(formData.modifierGroupIds || []).includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onFormDataChange({
                              modifierGroupIds: [...(formData.modifierGroupIds || []), group.id]
                            });
                          } else {
                            onFormDataChange({
                              modifierGroupIds: (formData.modifierGroupIds || []).filter(id => id !== group.id)
                            });
                          }
                        }}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{group.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({group.type === 'SINGLE_CHOICE' ? 'Single Choice' : 'Multiple'})
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

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!formData.name.trim() || !formData.price.trim() || isSaving}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {saveProgress || 'Saving...'}
              </span>
            ) : (
              mode === 'add' ? 'Add Item' : 'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
