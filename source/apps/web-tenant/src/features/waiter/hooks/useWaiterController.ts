'use client';

/**
 * Waiter Controller Hook - Public API
 * Manages all state and actions for Service Board
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useServiceOrders } from './queries';
import { sortOrdersByStatus } from '../utils';
import type { ServiceOrder, OrderStatus, ServiceTabCounts } from '../model/types';
import { logger } from '@/shared/utils/logger';

interface WaiterState {
  // Data
  orders: ServiceOrder[];
  isLoading: boolean;
  error: Error | null;
  
  // UI State
  activeTab: OrderStatus;
  expandedOrders: Set<string>;
  soundEnabled: boolean;
  autoRefresh: boolean;
  
  // Derived
  currentOrders: ServiceOrder[];
  tabCounts: ServiceTabCounts;
  
  // Toast
  showSuccessToast: boolean;
  toastMessage: string;
}

interface WaiterActions {
  // Tab
  setActiveTab: (tab: OrderStatus) => void;
  
  // Order actions
  acceptOrder: (order: ServiceOrder) => void;
  rejectOrder: (order: ServiceOrder) => void;
  cancelOrder: (order: ServiceOrder) => void;
  markServed: (order: ServiceOrder) => void;
  markCompleted: (order: ServiceOrder) => void;
  markPaid: (order: ServiceOrder) => void;
  closeTable: (order: ServiceOrder) => void;
  toggleOrderExpanded: (orderId: string) => void;
  
  // UI actions
  toggleSound: () => void;
  toggleAutoRefresh: () => void;
  refresh: () => void;
  manualOrder: () => void;
  closeToast: () => void;
}

export interface UseWaiterControllerReturn {
  state: WaiterState;
  actions: WaiterActions;
}

export function useWaiterController(): UseWaiterControllerReturn {
  // Data from query hook
  const { orders: fetchedOrders, isLoading, error, refetch } = useServiceOrders();
  
  // Local state for orders (for optimistic updates)
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<OrderStatus>('ready');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync fetched orders to local state
  useEffect(() => {
    setOrders(fetchedOrders);
  }, [fetchedOrders]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const refreshInterval = setInterval(() => {
      refetch();
    }, 15000); // 15 seconds

    return () => clearInterval(refreshInterval);
  }, [autoRefresh, refetch]);

  // Derived values
  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  }, [orders]);

  const tabCounts: ServiceTabCounts = useMemo(() => {
    const counts = {
      placed: getOrdersByStatus('placed').length,
      confirmed: getOrdersByStatus('confirmed').length,
      preparing: getOrdersByStatus('preparing').length,
      ready: getOrdersByStatus('ready').length,
      served: getOrdersByStatus('served').length,
      completed: getOrdersByStatus('completed').length,
    };

    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      logger.info('[ui] TAB_COUNTS_COMPUTED', {
        feature: 'waiter',
        entity: 'tabCounts',
        counts,
      });
    }

    return counts;
  }, [getOrdersByStatus]);

  const currentOrders = useMemo(() => {
    const sorted = sortOrdersByStatus(orders, activeTab);
    
    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      logger.info('[ui] TAB_ORDERS_APPLIED', {
        feature: 'waiter',
        entity: 'currentOrders',
        activeTab,
        inputCount: orders.length,
        outputCount: sorted.length,
        sample: process.env.NEXT_PUBLIC_LOG_DATA === 'true' && sorted[0]
          ? {
              orderNumber: sorted[0].orderNumber,
              table: sorted[0].table,
              status: sorted[0].status,
              itemsCount: sorted[0].items?.length || 0,
              total: sorted[0].total,
            }
          : undefined,
      });
    }
    
    return sorted;
  }, [orders, activeTab]);

  // Helper to update order and show toast
  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus, message: string) => {
    // INVARIANT: Check if order exists before updating
    const orderExists = orders.some(o => o.id === orderId);
    if (!orderExists) {
      logger.warn('[invariant] ORDER_NOT_FOUND_FOR_UPDATE', {
        orderId,
        attemptedStatus: newStatus,
        availableOrderIds: orders.map(o => o.id),
      });
    }

    setOrders(prev => 
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
    setToastMessage(message);
    setShowSuccessToast(true);
  }, [orders]);

  // Actions
  const actions: WaiterActions = {
    setActiveTab,
    
    acceptOrder: useCallback((order: ServiceOrder) => {
            logger.info('[waiter] ACCEPT_ORDER_ACTION', {
              orderId: order.id,
              orderNumber: order.orderNumber,
              table: order.table,
              fromStatus: order.status,
              toStatus: 'confirmed',
            });
      updateOrderStatus(order.id, 'confirmed', `${order.orderNumber} accepted and sent to kitchen`);
    }, [updateOrderStatus]),
    
    rejectOrder: useCallback((order: ServiceOrder) => {
            logger.info('[waiter] REJECT_ORDER_ACTION', {
              orderId: order.id,
              orderNumber: order.orderNumber,
              table: order.table,
              fromStatus: order.status,
              toStatus: 'completed',
            });
      updateOrderStatus(order.id, 'completed', `${order.orderNumber} rejected`);
    }, [updateOrderStatus]),
    
    cancelOrder: useCallback((order: ServiceOrder) => {
            logger.info('[waiter] CANCEL_ORDER_ACTION', {
              orderId: order.id,
              orderNumber: order.orderNumber,
              table: order.table,
              fromStatus: order.status,
              toStatus: 'completed',
            });
      updateOrderStatus(order.id, 'completed', `${order.orderNumber} cancelled`);
    }, [updateOrderStatus]),
    
    markServed: useCallback((order: ServiceOrder) => {
            logger.info('[waiter] MARK_SERVED_ACTION', {
              orderId: order.id,
              orderNumber: order.orderNumber,
              table: order.table,
              fromStatus: order.status,
              toStatus: 'served',
            });
      updateOrderStatus(order.id, 'served', `${order.orderNumber} marked as served`);
    }, [updateOrderStatus]),
    
    markCompleted: useCallback((order: ServiceOrder) => {
            logger.info('[waiter] MARK_COMPLETED_ACTION', {
              orderId: order.id,
              orderNumber: order.orderNumber,
              table: order.table,
              fromStatus: order.status,
              toStatus: 'completed',
            });
      updateOrderStatus(order.id, 'completed', `${order.orderNumber} marked as completed`);
    }, [updateOrderStatus]),
    
    markPaid: useCallback((order: ServiceOrder) => {
            logger.info('[waiter] MARK_PAID_ACTION', {
              orderId: order.id,
              orderNumber: order.orderNumber,
              table: order.table,
              previousPaymentStatus: order.paymentStatus,
              newPaymentStatus: 'paid',
            });
      setOrders(prev => 
        prev.map((o) => (o.id === order.id ? { ...o, paymentStatus: 'paid' } : o))
      );
      setToastMessage(`${order.orderNumber} payment marked as complete`);
      setShowSuccessToast(true);
    }, []),
    
    closeTable: useCallback((order: ServiceOrder) => {
            logger.info('[waiter] CLOSE_TABLE_ACTION', {
              orderId: order.id,
              orderNumber: order.orderNumber,
              table: order.table,
              status: order.status,
            });
      setToastMessage(`${order.table} closed successfully`);
      setShowSuccessToast(true);
    }, []),
    
    toggleOrderExpanded: useCallback((orderId: string) => {
      setExpandedOrders(prev => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(orderId)) {
          newExpanded.delete(orderId);
        } else {
          newExpanded.add(orderId);
        }
        return newExpanded;
      });
    }, []),
    
    toggleSound: useCallback(() => setSoundEnabled(prev => !prev), []),
    toggleAutoRefresh: useCallback(() => setAutoRefresh(prev => !prev), []),
    
    refresh: useCallback(() => {
        logger.info('[waiter] REFRESH_ACTION', { trigger: 'manual' });
      refetch();
      setToastMessage('Orders refreshed');
      setShowSuccessToast(true);
    }, [refetch]),
    
    manualOrder: useCallback(() => {
      setToastMessage('Manual order feature - Coming soon');
      setShowSuccessToast(true);
    }, []),
    
    closeToast: useCallback(() => setShowSuccessToast(false), []),
  };

  // State
  const state: WaiterState = {
    orders,
    isLoading,
    error,
    activeTab,
    expandedOrders,
    soundEnabled,
    autoRefresh,
    currentOrders,
    tabCounts,
    showSuccessToast,
    toastMessage,
  };

  return { state, actions };
}
