/**
 * Menu React Query Hooks
 * Uses factory pattern to switch between mock and API adapters
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuAdapter } from '../data/factory';
import type { 
  CreateMenuCategoryDto, 
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateModifierGroupDto,
  UpdateModifierGroupDto
} from '@/services/generated/models';

/**
 * Menu Categories Hooks
 */
export const useMenuCategories = () => {
  return useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: () => menuAdapter.categories.findAll(),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuCategoryDto) => menuAdapter.categories.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuCategoryDto }) => 
      menuAdapter.categories.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

/**
 * Menu Items Hooks
 */
export const useMenuItems = () => {
  return useQuery({
    queryKey: ['menu', 'items'],
    queryFn: () => menuAdapter.items.findAll(),
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuItemDto) => menuAdapter.items.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemDto }) => 
      menuAdapter.items.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.items.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
    },
  });
};

/**
 * Modifiers Hooks
 */
export const useModifiers = () => {
  return useQuery({
    queryKey: ['menu', 'modifiers'],
    queryFn: () => menuAdapter.modifiers.findAll(),
  });
};

export const useCreateModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModifierGroupDto) => menuAdapter.modifiers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
    },
  });
};

export const useUpdateModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModifierGroupDto }) => 
      menuAdapter.modifiers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
    },
  });
};

export const useDeleteModifier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.modifiers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
    },
  });
};

/**
 * Menu Photos Hooks
 */
export const useUploadPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => menuAdapter.photos.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => menuAdapter.photos.delete(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
    },
  });
};
