/**
 * Tables View Model Hook
 *
 * Encapsulates data transformation and derived state:
 * - Maps API response to Table interface
 * - Calculates summary statistics
 *
 * Pure logic for transforming raw API data into usable view models.
 */

import { useMemo } from 'react';
import type { Table, TableSummary } from '@/features/tables/model/types';

interface ApiTableResponse {
  id: string;
  tableNumber?: string;
  displayOrder?: number;
  capacity: number;
  status?: string;
  location?: string;
  description?: string;
  qrToken?: string;
  qrCodeUrl?: string;
  createdAt?: string;
}

export function useTablesViewModel(
  apiResponse: ApiTableResponse[] | null | undefined,
  isLoading: boolean,
  error: any
) {
  // ============================================================================
  // DATA MAPPING
  // ============================================================================

  // Map API response to Table interface
  const tables = useMemo(() => {
    if (!apiResponse) return [];
    return apiResponse.map((t) => ({
      id: t.id,
      name: t.tableNumber || `Table ${t.displayOrder}`,
      capacity: t.capacity,
      status: (t.status?.toLowerCase() ||
        'available') as 'available' | 'occupied' | 'reserved' | 'inactive',
      zone: (t.location?.toLowerCase() ||
        'indoor') as 'indoor' | 'outdoor' | 'patio' | 'vip',
      tableNumber: t.displayOrder || 0,
      createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
      description: t.description,
      qrToken: t.qrToken,
      qrCodeUrl: t.qrCodeUrl,
    }));
  }, [apiResponse]);

  // Calculate summary stats
  const summary: TableSummary = useMemo(
    () => ({
      total: tables.length,
      available: tables.filter((t) => t.status === 'available').length,
      occupied: tables.filter((t) => t.status === 'occupied').length,
      reserved: tables.filter((t) => t.status === 'reserved').length,
      inactive: tables.filter((t) => t.status === 'inactive').length,
      totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
    }),
    [tables]
  );

  // ============================================================================
  // RETURN VIEW MODEL
  // ============================================================================

  return {
    tables,
    summary,
    isLoading,
    error,
  };
}
