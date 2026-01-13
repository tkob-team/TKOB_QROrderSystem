/**
 * Modifiers Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/shared/utils/logger';
import { menuAdapter } from '../../data';

const MODIFIERS_QUERY_KEY = ['menu', 'modifiers'] as const;

export const useModifiers = (_params?: { activeOnly?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'modifiers'],
    queryFn: async () => {
      logger.info('[menu] MODIFIERS_LIST_QUERY_ATTEMPT');
      try {
        const result = await menuAdapter.modifiers.findAll();
        logger.info('[menu] MODIFIERS_LIST_QUERY_SUCCESS', { count: result?.length || 0 });
        return result;
      } catch (error) {
        logger.error('[menu] MODIFIERS_LIST_QUERY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      }
    },
    select: (data) => {
      // Clone data to ensure new array/object references on every query
      // This allows memoized selectors in controller to re-compute when data changes in-place
      return (data ?? []).map((g: any) => ({
        ...g,
        options: (g.options ?? []).map((o: any) => ({ ...o })),
      }));
    },
  });
};

export const useCreateModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => menuAdapter.modifiers.create(data),
    onSuccess: (data) => {
      logger.debug('[menu] CREATE_MODIFIER_ATTEMPT');
      // Call controller callback first to handle cache update
      options?.mutation?.onSuccess?.(data);
      // Background sync after callback completes
      queryClient.invalidateQueries({ queryKey: MODIFIERS_QUERY_KEY });
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useUpdateModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      menuAdapter.modifiers.update(id, data),
    onSuccess: (data) => {
      // Call controller callback first
      options?.mutation?.onSuccess?.(data);
      // Background sync
      queryClient.invalidateQueries({ queryKey: MODIFIERS_QUERY_KEY });
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

export const useDeleteModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuAdapter.modifiers.delete(id),
    onSuccess: (data, groupId: string) => {
      // Call controller callback first with group id
      options?.mutation?.onSuccess?.(data, groupId);
      // Background sync
      queryClient.invalidateQueries({ queryKey: MODIFIERS_QUERY_KEY });
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};
