/**
 * Promotions React Query Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsApi } from '../data/promotions.api';
import type { CreatePromotionInput, UpdatePromotionInput } from '../model/types';

const QUERY_KEY = ['promotions'];

/**
 * Get all promotions
 */
export function usePromotions(params?: {
  page?: number;
  limit?: number;
  active?: boolean;
  includeExpired?: boolean;
}) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => promotionsApi.getPromotions(params),
  });
}

/**
 * Get single promotion
 */
export function usePromotion(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => promotionsApi.getPromotion(id),
    enabled: !!id,
  });
}

/**
 * Create promotion mutation
 */
export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromotionInput) => promotionsApi.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Update promotion mutation
 */
export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionInput }) =>
      promotionsApi.updatePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Delete promotion mutation
 */
export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promotionsApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Toggle active status
 */
export function useTogglePromotionActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      promotionsApi.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
