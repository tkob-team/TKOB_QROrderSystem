'use client';

/**
 * Orders Feature - Hooks Layer
 */

import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/shared/utils/logger';
import { inspectResponseShape, samplePayload } from '@/shared/utils/dataInspector';
import { isMockEnabled } from '@/shared/config/featureFlags';
import { ordersAdapter } from '../data';
import { Order, OrderFilters } from '../model/types';
import { INITIAL_ORDERS } from '../model/constants';

/**
 * useOrdersData
 * 
 * Manages orders state (mock data - replace with real API later)
 */
export function useOrdersData() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    const useLogging = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';
    const logData = process.env.NEXT_PUBLIC_LOG_DATA === 'true';
    const logDataFull = process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

    const fetchOrders = async () => {
      if (useLogging) {
        logger.info('[data] FETCH_START', {
          feature: 'orders',
          entity: 'orders',
          source: isMockEnabled('orders') ? 'mock' : 'api',
        });
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await ordersAdapter.getOrders();
        if (!active) return;
        setOrders(data);

        if (useLogging && logData) {
          const shape = inspectResponseShape(data);
          logger.info('[data] RESPONSE_SHAPE', {
            feature: 'orders',
            entity: 'orders',
            shape,
            sample: logDataFull && data[0] ? samplePayload(data[0]) : undefined,
          });
        }
      } catch (err) {
        if (!active) return;
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
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, []);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
  }, []);

  return {
    orders,
    setOrders,
    updateOrder,
    isLoading,
    error,
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
    dateFilter: 'today',
    searchQuery: '',
  });

  const filteredOrders = orders.filter(order => {
    // Date filter (simplified for demo)
    if (filters.dateFilter !== 'all' && filters.dateFilter !== 'today') return false;
    
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
 * Manages order status transitions + callbacks
 */
export function useOrderActions(
  updateOrder: (orderId: string, updates: Partial<Order>) => void,
  onSuccess: (message: string) => void
) {
  const getNowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const acceptOrder = useCallback((order: Order) => {
    if (order.orderStatus !== 'placed') return;
    
    updateOrder(order.id, {
      orderStatus: 'confirmed',
      timeline: {
        ...order.timeline,
        confirmed: getNowTime(),
      },
    });
    
    onSuccess(`Order ${order.orderNumber} accepted and sent to kitchen`);
  }, [updateOrder, onSuccess]);

  const rejectOrder = useCallback((order: Order) => {
    if (order.orderStatus !== 'placed') return;
    
    updateOrder(order.id, {
      orderStatus: 'cancelled',
      timeline: {
        ...order.timeline,
        cancelled: getNowTime(),
      },
    });
    
    onSuccess(`Order ${order.orderNumber} rejected`);
  }, [updateOrder, onSuccess]);

  const cancelOrder = useCallback((order: Order) => {
    if (order.orderStatus !== 'confirmed') return;
    
    updateOrder(order.id, {
      orderStatus: 'cancelled',
      timeline: {
        ...order.timeline,
        cancelled: getNowTime(),
      },
    });
    
    onSuccess(`Order ${order.orderNumber} cancelled`);
  }, [updateOrder, onSuccess]);

  return {
    acceptOrder,
    rejectOrder,
    cancelOrder,
  };
}
