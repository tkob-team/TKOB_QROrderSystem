/**
 * Modifiers Hooks
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuAdapter } from '../../data';

export const useModifiers = (_params?: { activeOnly?: boolean }) => {
  return useQuery({
    queryKey: ['menu', 'modifiers', _params],
    queryFn: () => menuAdapter.modifiers.findAll(),
  });
};

export const useCreateModifier = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => menuAdapter.modifiers.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
      options?.mutation?.onSuccess?.(data);
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
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
      options?.mutation?.onSuccess?.(data);
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'modifiers'] });
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};
