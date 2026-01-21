/**
 * Menu Items Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/shared/utils/logger';
import { menuAdapter } from '../../data';
import type { CreateMenuItemDto, UpdateMenuItemDto } from '@/services/generated/models';

interface UseMenuItemsParams {
  categoryId?: string;
  status?: string;
  availability?: 'available' | 'unavailable';
  chefRecommended?: boolean;
  search?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export const useMenuItems = (params?: UseMenuItemsParams) => {
  return useQuery({
    queryKey: ['menu', 'items', params],
    queryFn: async () => {
      logger.info('[menu] ITEMS_LIST_QUERY_ATTEMPT', { hasParams: !!params });
      try {
        const result = await menuAdapter.items.findAll(params);
        const count = Array.isArray(result) ? result.length : result.data?.length || 0;
        logger.info('[menu] ITEMS_LIST_QUERY_SUCCESS', { count });
        return result;
      } catch (error) {
        logger.error('[menu] ITEMS_LIST_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
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
