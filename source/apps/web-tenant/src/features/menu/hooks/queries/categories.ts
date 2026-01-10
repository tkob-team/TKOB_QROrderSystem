/**
 * Menu Categories Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuAdapter } from '../../data';
import type { CreateMenuCategoryDto, UpdateMenuCategoryDto } from '@/services/generated/models';

export const useMenuCategories = () => {
  return useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: () => menuAdapter.categories.findAll(),
  });
};

export const useCreateCategory = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuCategoryDto) => menuAdapter.categories.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useUpdateCategory = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuCategoryDto }) =>
      menuAdapter.categories.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeleteCategory = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.categories.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useCategory = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'categories', id],
    queryFn: () => menuAdapter.categories.findOne(id),
    enabled: options?.enabled ?? !!id,
  });
};
