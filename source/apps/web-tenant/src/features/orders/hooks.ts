'use client';

/**
 * Orders Feature - Hooks Layer
 */

import { useState, useCallback } from 'react';
import { Order, OrderFilters } from './types';
import { INITIAL_ORDERS } from './constants';

/**
 * useOrdersData
 * 
 * Manages orders state (mock data - replace with real API later)
 */
export function useOrdersData() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
  }, []);

  return {
    orders,
    setOrders,
    updateOrder,
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
