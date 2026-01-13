/**
 * Menu Items Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuAdapter } from '../../data';
import type { CreateMenuItemDto, UpdateMenuItemDto } from '@/services/generated/models';

interface UseMenuItemsParams {
  categoryId?: string;
  status?: string;
  availability?: 'available' | 'unavailable';
  chefRecommended?: boolean;
  searchQuery?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export const useMenuItems = (params?: UseMenuItemsParams) => {
  return useQuery({
    queryKey: ['menu', 'items', params],
    queryFn: () => menuAdapter.items.findAll(params),
  });
};

export const useMenuItem = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'items', id],
    queryFn: () => menuAdapter.items.findOne(id),
    enabled: options?.enabled ?? !!id,
  });
};

export const useCreateMenuItem = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuItemDto) => menuAdapter.items.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useUpdateMenuItem = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemDto }) =>
      menuAdapter.items.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeleteMenuItem = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.items.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useToggleItemAvailability = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuAdapter.items.toggleAvailability(id, { isAvailable }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'items'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};
