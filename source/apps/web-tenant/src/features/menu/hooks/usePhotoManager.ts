'use client';

import { useDeletePhoto, useUploadPhoto } from './queries/photos';
import type { MenuItemFormData } from '../model/types';

export function usePhotoManager() {
  const uploadPhotoMutation = useUploadPhoto();
  const deletePhotoMutation = useDeletePhoto();

  const getOperations = (itemId: string, formData: MenuItemFormData) => {
    const ops: Promise<any>[] = [];

    // Upload new photos
    const newPhotos = (formData.photos || []).filter((p) => p.file);
    for (const photo of newPhotos) {
      ops.push(
        uploadPhotoMutation.mutateAsync({
          itemId,
          file: photo.file as File,
        })
      );
    }

    // Delete marked photos
    for (const photoId of formData.photosToDelete || []) {
      ops.push(
        deletePhotoMutation.mutateAsync({
          itemId,
          photoId,
        })
      );
    }

    return ops;
  };

  const executeAll = async (ops: Promise<any>[]) => {
    if (ops.length === 0) return;
    await Promise.all(ops);
  };

  return {
    getOperations,
    executeAll,
  };
}
