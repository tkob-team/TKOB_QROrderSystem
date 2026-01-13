/**
 * Menu Photos Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuAdapter } from '../../data';

export const useUploadPhoto = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, file }: { itemId: string; file: File }) =>
      menuAdapter.photos.upload(itemId, { file }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'photos'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeletePhoto = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, photoId }: { itemId: string; photoId: string }) =>
      menuAdapter.photos.delete(itemId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'photos'] });
      options?.mutation?.onSuccess?.();
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useItemPhotos = (itemId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'photos', itemId],
    queryFn: () => menuAdapter.photos.getPhotos(itemId),
    enabled: options?.enabled ?? !!itemId,
  });
};

export const useSetPrimaryPhoto = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, photoId }: { itemId: string; photoId: string }) =>
      menuAdapter.photos.setPrimary(itemId, photoId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'photos'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};
