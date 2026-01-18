'use client';

/**
 * Orders Feature - Hooks Layer
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '@/shared/utils/logger';
import { inspectResponseShape, samplePayload } from '@/shared/utils/dataInspector';
import { isMockEnabled } from '@/shared/config/featureFlags';
import { ordersAdapter } from '../data';
import type { OrderApiFilters, PaginatedOrders } from '../data/adapter.interface';
import { Order, OrderFilters } from '../model/types';

/**
 * useOrdersData
 * 
 * Manages orders state with real API support
 */
export function useOrdersData() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Default filter: exclude PAID orders (already closed tables)
  const [apiFilters, setApiFilters] = useState<OrderApiFilters>({
    status: 'PENDING,RECEIVED,PREPARING,READY,SERVED,COMPLETED',
  });
  
  // Ref to track if initial fetch happened
  const hasFetched = useRef(false);

  const fetchOrders = useCallback(async (filters?: OrderApiFilters) => {
    const useLogging = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';
    const logData = process.env.NEXT_PUBLIC_LOG_DATA === 'true';
    const logDataFull = process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

    if (useLogging) {
      logger.info('[data] FETCH_START', {
        feature: 'orders',
        entity: 'orders',
        source: isMockEnabled('orders') ? 'mock' : 'api',
        filters,
      });
    }

    setIsLoading(true);
    setError(null);

    try {
      const result: PaginatedOrders = await ordersAdapter.getOrders(filters);
      setOrders(result.data);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });

      if (useLogging && logData) {
        const shape = inspectResponseShape(result.data);
        logger.info('[data] RESPONSE_SHAPE', {
          feature: 'orders',
          entity: 'orders',
          shape,
          total: result.total,
          page: result.page,
          sample: logDataFull && result.data[0] ? samplePayload(result.data[0]) : undefined,
        });
      }
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error('Failed to fetch orders');
      setError(normalizedError);

      if (useLogging) {
        logger.error('[data] FETCH_ERROR', {
          feature: 'orders',
          entity: 'orders',
          source: isMockEnabled('orders') ? 'mock' : 'api',
          message: normalizedError.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchOrders(apiFilters);
    }
  }, [fetchOrders, apiFilters]);

  // Refetch when API filters change
  const updateApiFilters = useCallback((newFilters: OrderApiFilters) => {
    setApiFilters(newFilters);
    fetchOrders(newFilters);
  }, [fetchOrders]);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
  }, []);

  const refetch = useCallback(() => {
    fetchOrders(apiFilters);
  }, [fetchOrders, apiFilters]);

  return {
    orders,
    setOrders,
    updateOrder,
    pagination,
    isLoading,
    error,
    refetch,
    updateApiFilters,
  };
}

/**
 * useOrderFilters
 * 
 * Manages filter state và filter logic
 */
export function useOrderFilters(orders: Order[]) {
  const [filters, setFilters] = useState<OrderFilters>({
    statusFilter: 'all',
    tableFilter: 'all',
    dateFilter: 'all',
    searchQuery: '',
  });

  const filteredOrders = orders.filter(order => {
    // Date filter
    if (filters.dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filters.dateFilter === 'today') {
        const orderDateOnly = new Date(orderDate);
        orderDateOnly.setHours(0, 0, 0, 0);
        if (orderDateOnly.getTime() !== today.getTime()) return false;
      }
    }
    
    // Status filter
    if (filters.statusFilter !== 'all' && order.orderStatus !== filters.statusFilter) return false;
    
    // Table filter
    if (filters.tableFilter !== 'all' && order.table !== filters.tableFilter) return false;
    
    // Search filter
    if (filters.searchQuery && 
        !order.orderNumber.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !order.table.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
    logger.info('[ui] FILTER_APPLIED', {
      feature: 'orders',
      entity: 'orders',
      inputCount: orders.length,
      outputCount: filteredOrders.length,
      filters: process.env.NEXT_PUBLIC_LOG_DATA === 'true'
        ? {
            statusFilter: filters.statusFilter,
            tableFilter: filters.tableFilter,
            dateFilter: filters.dateFilter,
            hasSearchQuery: !!filters.searchQuery,
          }
        : undefined,
    });
  }

  // Active filters for UI
  const activeFilters = [];
  if (filters.dateFilter !== 'all') {
    activeFilters.push({ key: 'date', label: filters.dateFilter === 'today' ? 'Today' : filters.dateFilter });
  }
  if (filters.statusFilter !== 'all') {
    activeFilters.push({ key: 'status', label: filters.statusFilter });
  }
  if (filters.tableFilter !== 'all') {
    activeFilters.push({ key: 'table', label: filters.tableFilter });
  }
  if (filters.searchQuery) {
    activeFilters.push({ key: 'search', label: `"${filters.searchQuery}"` });
  }

  if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
    logger.info('[ui] ACTIVE_FILTERS_COMPUTED', {
      feature: 'orders',
      entity: 'activeFilters',
      count: activeFilters.length,
      filters: process.env.NEXT_PUBLIC_LOG_DATA === 'true'
        ? activeFilters
        : undefined,
    });
  }

  const updateFilter = useCallback((key: keyof OrderFilters, value: string) => {
    setFilters((prev: OrderFilters) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    if (key === 'date') setFilters((prev: OrderFilters) => ({ ...prev, dateFilter: 'all' }));
    if (key === 'status') setFilters((prev: OrderFilters) => ({ ...prev, statusFilter: 'all' }));
    if (key === 'table') setFilters((prev: OrderFilters) => ({ ...prev, tableFilter: 'all' }));
    if (key === 'search') setFilters((prev: OrderFilters) => ({ ...prev, searchQuery: '' }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      statusFilter: 'all',
      tableFilter: 'all',
      dateFilter: 'all',
      searchQuery: '',
    });
  }, []);

  return {
    filters,
    filteredOrders,
    activeFilters,
    updateFilter,
    removeFilter,
    clearAllFilters,
  };
}

/**
 * useOrderActions
 * 
 * Manages order status transitions with real API calls
 */
export function useOrderActions(
  updateOrder: (orderId: string, updates: Partial<Order>) => void,
  onSuccess: (message: string) => void,
  refetch?: () => void
) {
  const [isUpdating, setIsUpdating] = useState(false);

  const acceptOrder = useCallback(async (order: Order) => {
    if (order.orderStatus !== 'placed') return;
    
    setIsUpdating(true);
    try {
      const updated = await ordersAdapter.updateOrderStatus(order.id, 'confirmed');
      updateOrder(order.id, updated);
      onSuccess(`Order ${order.orderNumber} accepted and sent to kitchen`);
    } catch (err) {
      logger.error('[orders] Failed to accept order', { orderId: order.id, error: err });
      // Optionally show error toast
    } finally {
      setIsUpdating(false);
    }
  }, [updateOrder, onSuccess]);

  const rejectOrder = useCallback(async (order: Order) => {
    if (order.orderStatus !== 'placed') return;
    
    setIsUpdating(true);
    try {
      const updated = await ordersAdapter.cancelOrder(order.id, 'Rejected by staff');
      updateOrder(order.id, updated);
      onSuccess(`Order ${order.orderNumber} rejected`);
    } catch (err) {
      logger.error('[orders] Failed to reject order', { orderId: order.id, error: err });
    } finally {
      setIsUpdating(false);
    }
  }, [updateOrder, onSuccess]);

  const cancelOrder = useCallback(async (order: Order, reason?: string) => {
    if (!['placed', 'confirmed'].includes(order.orderStatus)) return;
    
    setIsUpdating(true);
    try {
      const updated = await ordersAdapter.cancelOrder(order.id, reason || 'Cancelled by staff');
      updateOrder(order.id, updated);
      onSuccess(`Order ${order.orderNumber} cancelled`);
    } catch (err) {
      logger.error('[orders] Failed to cancel order', { orderId: order.id, error: err });
    } finally {
      setIsUpdating(false);
    }
  }, [updateOrder, onSuccess]);

  const advanceStatus = useCallback(async (order: Order) => {
    const statusFlow: Record<string, Order['orderStatus']> = {
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: 'completed',
    };
    
    const nextStatus = statusFlow[order.orderStatus];
    if (!nextStatus) return;
    
    setIsUpdating(true);
    try {
      const updated = await ordersAdapter.updateOrderStatus(order.id, nextStatus);
      updateOrder(order.id, updated);
      onSuccess(`Order ${order.orderNumber} → ${nextStatus}`);
    } catch (err) {
      logger.error('[orders] Failed to advance status', { orderId: order.id, error: err });
    } finally {
      setIsUpdating(false);
    }
  }, [updateOrder, onSuccess]);

  return {
    acceptOrder,
    rejectOrder,
    cancelOrder,
    advanceStatus,
    isUpdating,
  };
}
