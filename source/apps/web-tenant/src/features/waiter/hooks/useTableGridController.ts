/**
 * Table Grid Controller Hook
 * Manages table overview state and actions
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TableViewItem,
  TableViewStatus,
  TableGridState,
  TableGridActions,
} from '../model/table-types';
import { logger } from '@/shared/utils/logger';

// Mock API functions - replace with real API calls
const fetchTablesWithOrders = async (): Promise<TableViewItem[]> => {
  // In real implementation, call API:
  // const response = await api.get('/admin/tables/overview');
  // return response.data;
  
  // Mock data for development
  return [
    {
      id: '1',
      name: 'Bàn 1',
      zone: 'Tầng 1',
      capacity: 4,
      status: 'occupied',
      sessionId: 'session-1',
      guestCount: 3,
      occupiedSince: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      totalSpent: 450000,
      activeOrders: [
        { id: 'ord-1', orderNumber: 'ORD-001', status: 'ready', itemCount: 5, total: 350000, minutesAgo: 15 },
        { id: 'ord-2', orderNumber: 'ORD-002', status: 'preparing', itemCount: 2, total: 100000, minutesAgo: 5 },
      ],
    },
    {
      id: '2',
      name: 'Bàn 2',
      zone: 'Tầng 1',
      capacity: 2,
      status: 'available',
      activeOrders: [],
    },
    {
      id: '3',
      name: 'Bàn 3',
      zone: 'Tầng 1',
      capacity: 6,
      status: 'needs-service',
      sessionId: 'session-3',
      guestCount: 4,
      occupiedSince: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      totalSpent: 780000,
      activeOrders: [
        { id: 'ord-3', orderNumber: 'ORD-003', status: 'served', itemCount: 8, total: 780000, minutesAgo: 60 },
      ],
    },
    {
      id: '4',
      name: 'Bàn 4',
      zone: 'Tầng 2',
      capacity: 4,
      status: 'reserved',
      activeOrders: [],
    },
    {
      id: '5',
      name: 'Bàn 5',
      zone: 'Tầng 2',
      capacity: 8,
      status: 'occupied',
      sessionId: 'session-5',
      guestCount: 6,
      occupiedSince: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      totalSpent: 1200000,
      activeOrders: [
        { id: 'ord-4', orderNumber: 'ORD-004', status: 'completed', itemCount: 12, total: 1200000, minutesAgo: 25 },
      ],
    },
  ];
};

const clearTableSession = async (tableId: string): Promise<void> => {
  // In real implementation:
  // await api.post(`/admin/tables/${tableId}/clear`);
  logger.info('Clear table session', { tableId });
};

const updateTableStatus = async (tableId: string, status: TableViewStatus): Promise<void> => {
  // In real implementation:
  // await api.patch(`/admin/tables/${tableId}/status`, { status });
  logger.info('Update table status', { tableId, status });
};

export interface UseTableGridControllerReturn {
  state: TableGridState;
  actions: TableGridActions;
}

export function useTableGridController(): UseTableGridControllerReturn {
  const queryClient = useQueryClient();
  
  // Local UI state
  const [selectedTable, setSelectedTable] = useState<TableViewItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<TableViewStatus | 'all'>('all');

  // Fetch tables with orders
  // Note: Real-time updates are handled by useWaiterWebSocket which invalidates this query
  const { data: tables = [], isLoading, error, refetch } = useQuery({
    queryKey: ['tables', 'overview'],
    queryFn: fetchTablesWithOrders,
    staleTime: 30000, // Consider stale after 30s
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Clear table mutation
  const clearTableMutation = useMutation({
    mutationFn: clearTableSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setSelectedTable(null);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ tableId, status }: { tableId: string; status: TableViewStatus }) =>
      updateTableStatus(tableId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  // Filter tables
  const filteredTables = useMemo(() => {
    if (filterStatus === 'all') return tables;
    return tables.filter((t) => t.status === filterStatus);
  }, [tables, filterStatus]);

  // Actions
  const selectTable = useCallback((table: TableViewItem | null) => {
    setSelectedTable(table);
  }, []);

  const clearTable = useCallback((tableId: string) => {
    clearTableMutation.mutate(tableId);
  }, [clearTableMutation]);

  const changeTableStatus = useCallback((tableId: string, status: TableViewStatus) => {
    updateStatusMutation.mutate({ tableId, status });
  }, [updateStatusMutation]);

  const startManualOrder = useCallback((tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    logger.info('[waiter] START_MANUAL_ORDER', { tableId, tableNumber: table.tableNumber });
    
    // Navigate to manual order page with table context
    // Note: Manual order page should be created at /admin/waiter/orders/new
    if (typeof window !== 'undefined') {
      window.location.href = `/admin/waiter/orders/new?tableId=${tableId}&tableNumber=${table.tableNumber}`;
    }
  }, [tables]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    state: {
      tables: filteredTables,
      isLoading,
      error: error as Error | null,
      selectedTable,
      viewMode,
      filterStatus,
    },
    actions: {
      selectTable,
      clearTable,
      changeTableStatus,
      startManualOrder,
      setViewMode,
      setFilterStatus,
      refresh,
    },
  };
}
