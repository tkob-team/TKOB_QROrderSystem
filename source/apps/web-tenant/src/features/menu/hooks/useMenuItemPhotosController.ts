"use client";

import { useItemPhotos, useSetPrimaryPhoto } from './queries/photos';

type ItemMode = 'add' | 'edit';

interface MenuItemPhotosParams {
  itemId?: string;
  isOpen: boolean;
  mode: ItemMode;
}

// Controller wrapper keeping photo queries internal
export function useMenuItemPhotosController({ itemId, isOpen, mode }: MenuItemPhotosParams) {
  const itemPhotosQuery = useItemPhotos(itemId || '', {
    enabled: isOpen && mode === 'edit' && !!itemId,
  });

  const setPrimaryPhotoMutation = useSetPrimaryPhoto();

  return {
    itemPhotosQuery,
    setPrimaryPhotoMutation,
  };
}
