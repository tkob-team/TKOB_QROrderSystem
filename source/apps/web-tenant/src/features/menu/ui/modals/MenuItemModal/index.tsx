import React from 'react';
import { X } from 'lucide-react';
import type { MenuItemFormData, ModalMode, Category } from '../../../model/types';
import type { ModifierGroup } from '../../../model/modifiers';
import { useMenuItemPhotosController } from '../../../hooks';
import { PhotosSection } from './PhotosSection';
import { DetailsFields } from './DetailsFields';
import { PricingFields } from './PricingFields';
import { AvailabilityFields } from './AvailabilityFields';
import { ModifiersSection } from './ModifiersSection';

interface MenuItemModalProps {
  isOpen: boolean;
  mode: ModalMode;
  itemId?: string;
  formData: MenuItemFormData;
  categories: Category[];
  modifierGroups: ModifierGroup[];
  onClose: () => void;
  onSave: () => void;
  onFormChange: (data: MenuItemFormData) => void;
  isSaving?: boolean;
}

export function MenuItemModal({
  isOpen,
  mode,
  itemId,
  formData,
  categories,
  modifierGroups,
  onClose,
  onSave,
  onFormChange,
  isSaving,
}: MenuItemModalProps) {
  const { itemPhotosQuery, setPrimaryPhotoMutation: setPhotoMutation } = useMenuItemPhotosController({
    itemId,
    isOpen,
    mode,
  });

  const { data: existingPhotos = [] } = itemPhotosQuery;

  const handleSetPrimaryPhoto = async (photoId: string) => {
    if (!itemId) return;
    await setPhotoMutation.mutateAsync({
      itemId,
      photoId,
    });
  };

  const handleDeleteExistingPhoto = (photoId: string) => {
    const photosToDelete = formData.photosToDelete || [];
    if (!photosToDelete.includes(photoId)) {
      onFormChange({
        ...formData,
        photosToDelete: [...photosToDelete, photoId],
      });
    }
  };

  const isValid = formData.name.trim() && formData.price > 0 && formData.categoryId;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white w-full mx-4 rounded-lg shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: '560px', maxHeight: 'calc(100vh - 80px)' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{mode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          <PhotosSection
            mode={mode}
            existingPhotos={existingPhotos}
            formData={formData}
            onFormChange={onFormChange}
            onSetPrimaryExisting={handleSetPrimaryPhoto}
            onDeleteExisting={handleDeleteExistingPhoto}
          />

          <DetailsFields formData={formData} categories={categories} onFormChange={onFormChange} />

          <PricingFields formData={formData} onFormChange={onFormChange} />

          <AvailabilityFields formData={formData} onFormChange={onFormChange} />

          <ModifiersSection modifierGroups={modifierGroups} formData={formData} onFormChange={onFormChange} />
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
            {isSaving ? 'Saving...' : mode === 'add' ? 'Add Item' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
