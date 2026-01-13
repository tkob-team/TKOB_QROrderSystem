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
  // LOCATION NORMALIZATION
  // ============================================================================

  // Normalize location strings to display format
  const normalizeLocation = (location: string): string => {
    if (!location) return '';
    
    const locationMap: Record<string, string> = {
      'indoor': 'Indoor',
      'Indoor': 'Indoor',
      'outdoor': 'Outdoor',
      'Outdoor': 'Outdoor',
      'patio': 'Patio',
      'Patio': 'Patio',
      'vip': 'VIP Room',
      'vip room': 'VIP Room',
      'VIP Room': 'VIP Room',
    };
    
    return locationMap[location] || location;
  };

  // ============================================================================
  // DATA MAPPING
  // ============================================================================

  // Map API response to Table interface
  const tables = useMemo(() => {
    if (!apiResponse) return [];
    return apiResponse.map((t) => {
      // Extract numeric part and generate table name like "Table 1", "Table 2", etc.
      const tableNum = t.tableNumber?.replace(/[^0-9]/g, '') || t.displayOrder || '';
      const generatedName = tableNum ? `Table ${tableNum}` : `Table ${t.displayOrder}`;
      
      return {
        id: t.id,
        name: generatedName,
        capacity: t.capacity,
        status: (t.status?.toLowerCase() || 'available') as 'available' | 'occupied' | 'reserved' | 'inactive',
        location: normalizeLocation(t.location || ''),
        tableNumber: t.tableNumber || '',
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        description: t.description,
        qrToken: t.qrToken,
        qrCodeUrl: t.qrCodeUrl,
      };
    });
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
