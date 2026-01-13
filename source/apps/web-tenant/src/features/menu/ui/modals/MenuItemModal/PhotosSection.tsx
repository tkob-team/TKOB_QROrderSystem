import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import type { ModalMode, MenuItemFormData } from '../../../model/types';

interface ExistingPhoto {
  id: string;
  filename: string;
  size: number;
  isPrimary: boolean;
}

interface PhotosSectionProps {
  mode: ModalMode;
  existingPhotos: ExistingPhoto[];
  formData: MenuItemFormData;
  onFormChange: (data: MenuItemFormData) => void;
  onSetPrimaryExisting: (photoId: string) => void;
  onDeleteExisting: (photoId: string) => void;
}

export function PhotosSection({
  mode,
  existingPhotos,
  formData,
  onFormChange,
  onSetPrimaryExisting,
  onDeleteExisting,
}: PhotosSectionProps) {
  const handleLocalPrimary = (index: number) => {
    const newPhotos = formData.photos.map((photo, i) => ({
      ...photo,
      isPrimary: i === index,
    }));
    onFormChange({ ...formData, photos: newPhotos });
  };

  const handleRemoveLocal = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    onFormChange({ ...formData, photos: newPhotos });
  };

  const handleAddLocalPhotos = (files: FileList) => {
    const newPhotos = Array.from(files).map((file, index) => ({
      name: file.name,
      size: file.size,
      file,
      displayOrder: formData.photos.length + index,
      isPrimary: formData.photos.length === 0 && index === 0,
    }));
    onFormChange({ ...formData, photos: [...formData.photos, ...newPhotos] });
  };

  const hasExistingPhotos = mode === 'edit' && existingPhotos.length > 0;

  return (
    <>
      {hasExistingPhotos && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">Existing Photos</label>
          <div className="space-y-2">
            {existingPhotos
              .filter((photo) => !formData.photosToDelete?.includes(photo.id))
              .map((photo) => (
                <div
                  key={photo.id}
                  className={`border-2 rounded-lg p-3 flex items-start gap-3 transition-colors ${
                    photo.isPrimary ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{photo.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{(photo.size / 1024).toFixed(1)} KB</p>
                      {photo.isPrimary && (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500 text-white">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {!photo.isPrimary && (
                      <button
                        onClick={() => onSetPrimaryExisting(photo.id)}
                        className="text-xs font-semibold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteExisting(photo.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-100 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900">
          {mode === 'edit' ? 'Add More Photos' : 'Item Photos'}
        </label>

        {mode === 'add' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex gap-2">
            <span className="text-blue-600 text-lg">Tip</span>
            <p className="text-sm text-blue-700">Photos will be uploaded after the item is created</p>
          </div>
        )}

        {formData.photos.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.photos.map((photo, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-3 flex items-start gap-3 transition-colors ${
                  photo.isPrimary ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{photo.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{(photo.size / 1024).toFixed(1)} KB</p>
                    {photo.isPrimary && (
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap bg-emerald-500 text-white">
                        Primary
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {!photo.isPrimary && (
                    <button
                      onClick={() => handleLocalPrimary(index)}
                      className="text-xs font-semibold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveLocal(index)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-100 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className="border-2 border-dashed border-emerald-300 rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Add more photos</p>
          <p className="text-xs text-gray-500">PNG, JPG or WEBP (max. 5MB)</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = event.currentTarget.files;
              if (files) {
                handleAddLocalPhotos(files);
              }
              event.currentTarget.value = '';
            }}
            className="hidden"
          />
        </label>
      </div>
    </>
  );
}
