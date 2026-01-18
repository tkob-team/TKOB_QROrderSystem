/**
 * useKdsController - Main KDS UI Controller
 * Orchestrates queries, state management, and event handlers
 * This is the ONLY public hook exported from the kds feature
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/context/AuthContext';
import { logger } from '@/shared/utils/logger';
import { useKdsOrders } from './queries/useKdsOrders';
import { orderControllerUpdateOrderStatus } from '@/services/generated/orders/orders';
import { sortOrdersByStatus } from '../utils/sortOrders';
import type { KdsOrder, KdsStatus, KdsSummaryCounts } from '../model/types';

interface UseKdsControllerOptions {
  showKdsProfile?: boolean;
  enableKitchenServe?: boolean;
}

export function useKdsController(options: UseKdsControllerOptions = {}) {
  const { showKdsProfile = true, enableKitchenServe = false } = options;
  const router = useRouter();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ========== QUERIES ==========
  const { data: orders = [], isLoading, error } = useKdsOrders();

  // ========== STATE ==========
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ========== EFFECTS ==========
  // Update current time every second
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // ========== COMPUTED VALUES ==========
  // Sort orders by time DESC (higher time first - older orders first)
  // For PREPARING column: overdue orders first, then by time DESC
  const sortedNewOrders = sortOrdersByStatus.pending(orders);
  const sortedPreparingOrders = sortOrdersByStatus.preparing(orders);
  const sortedReadyOrders = sortOrdersByStatus.ready(orders);

  if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
    const overdueInPreparing = sortedPreparingOrders.filter(o => o.isOverdue).length;
    
    logger.info('[ui] COLUMN_SORTS_APPLIED', {
      feature: 'kds',
      entity: 'columns',
      newCount: sortedNewOrders.length,
      preparingCount: sortedPreparingOrders.length,
      readyCount: sortedReadyOrders.length,
      overdueInPreparing,
      sample: process.env.NEXT_PUBLIC_LOG_DATA === 'true' && sortedPreparingOrders[0]
        ? {
            id: sortedPreparingOrders[0].id,
            table: sortedPreparingOrders[0].table,
            status: sortedPreparingOrders[0].status,
            isOverdue: sortedPreparingOrders[0].isOverdue,
            elapsedMinutes: sortedPreparingOrders[0].time,
          }
        : undefined,
    });
  }

  // Calculate status summary
  const counts: KdsSummaryCounts = {
    pending: orders.filter((order) => order.status === 'pending').length,
    cooking: orders.filter((order) => order.status === 'preparing').length,
    ready: orders.filter((order) => order.status === 'ready').length,
    overdue: orders.filter((order) => order.isOverdue).length,
  };

  if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
    logger.info('[ui] AGGREGATION_COMPUTED', {
      feature: 'kds',
      entity: 'counts',
      counts,
    });
  }

  // ========== EVENT HANDLERS ==========
  const handleLogout = useCallback(() => {
    setIsUserMenuOpen(false);
    logout();
    router.push('/auth/login');
  }, [logout, router]);

  const handleAction = useCallback(async (orderId: string, columnId: string) => {
    setLoadingOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      logger.warn('[kds] STATUS_UPDATE_ACTION_MISSING_ORDER', { orderId, columnId });
      setLoadingOrderId(null);
      return;
    }

    const newStatus: KdsStatus =
      columnId === 'new' ? 'preparing' : columnId === 'preparing' ? 'ready' : 'served';
    const previousStatus = order.status;
    const itemCount = order.items?.length || 0;

    logger.info('[kds] STATUS_UPDATE_ACTION_ATTEMPT', {
      orderId,
      fromStatus: previousStatus,
      toStatus: newStatus,
      itemCount,
    });

    try {
      // Call API to update order status
      await orderControllerUpdateOrderStatus(orderId, {
        status: newStatus.toUpperCase() as any,
      });

      // Invalidate query to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['kds', 'orders'] });

      setToastMessage(`Order ${orderId} marked as ${newStatus}`);
      setShowSuccessToast(true);

      logger.info('[kds] STATUS_UPDATE_ACTION_SUCCESS', {
        orderId,
        fromStatus: previousStatus,
        toStatus: newStatus,
        itemCount,
      });
    } catch (error) {
      setToastMessage(`Failed to mark order ${orderId} as ${newStatus}`);
      setShowErrorToast(true);

      logger.error('[kds] STATUS_UPDATE_ACTION_ERROR', {
        orderId,
        fromStatus: previousStatus,
        toStatus: newStatus,
        itemCount,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoadingOrderId(null);
    }
  }, [orders, queryClient]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      // Play test sound when enabling (to verify it works)
      if (newValue) {
        // Import and play test sound
        import('@/lib/websocket').then(({ playNewOrderSound }) => {
          playNewOrderSound();
        });
      }
      return newValue;
    });
  }, []);

  const handleToggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => !prev);
  }, []);

  const handleToggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  // ========== RETURN ==========
  return {
    // State
    soundEnabled,
    autoRefresh,
    isUserMenuOpen,
    currentTime,
    loadingOrderId,
    showSuccessToast,
    showErrorToast,
    toastMessage,
    orders,
    userMenuRef,
    
    // Computed
    sortedNewOrders,
    sortedPreparingOrders,
    sortedReadyOrders,
    counts,
    
    // Props
    showKdsProfile,
    enableKitchenServe,
    
    // Handlers
    handleLogout,
    handleAction,
    handleToggleSound,
    handleToggleAutoRefresh,
    handleToggleUserMenu,
    setShowSuccessToast,
    setShowErrorToast,
    setToastMessage,
  };
}
