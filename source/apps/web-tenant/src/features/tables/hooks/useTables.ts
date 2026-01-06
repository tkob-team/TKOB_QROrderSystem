/**
 * Tables React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tablesAdapter } from '@/features/tables/data';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableControllerFindAllParams,
} from '@/services/generated/models';

/**
 * List tables query
 */
export const useTablesList = (params?: TableControllerFindAllParams) => {
  // Pass all params directly to backend (status, location, sortBy, sortOrder)
  // Backend handles filtering and sorting
  const queryParams = params || {};
  
  return useQuery({
    queryKey: ['tables', 'list', queryParams],
    queryFn: async () => {
      console.log('🔍 [useTablesList] Calling API with params:', queryParams);
      try {
        const result = await tablesAdapter.listTables(queryParams as TableControllerFindAllParams);
        console.log('📦 [useTablesList] Backend returned filtered & sorted data:', result);
        return result;
      } catch (error) {
        console.error('❌ [useTablesList] Error:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};

/**
 * Get table by ID query
 */
export const useTableById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['tables', 'detail', id],
    queryFn: () => tablesAdapter.getTableById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Create table mutation
 */
export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTableDto) => tablesAdapter.createTable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
    },
  });
};

/**
 * Update table mutation
 */
export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableDto }) =>
      tablesAdapter.updateTable(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['tables', 'detail', variables.id] });
    },
  });
};

/**
 * Delete table mutation
 */
export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tablesAdapter.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
    },
  });
};

/**
 * Update table status mutation
 */
export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE';
    }) => tablesAdapter.updateTableStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['tables', 'detail', variables.id] });
    },
  });
};

/**
 * Regenerate QR code mutation
 */
export const useRegenerateQR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tablesAdapter.regenerateQR(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['tables', 'detail', id] });
    },
  });
};

/**
 * Regenerate all QR codes mutation
 */
export const useRegenerateAllQR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tablesService.regenerateAllQR(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] });
    },
  });
};

/**
 * Get locations query
 */
export const useLocations = () => {
  return useQuery({
    queryKey: ['tables', 'locations'],
    queryFn: () => tablesAdapter.getLocations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
