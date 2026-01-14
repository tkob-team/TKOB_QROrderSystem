/**
 * useKdsController - Main KDS UI Controller
 * Orchestrates queries, state management, and event handlers
 * This is the ONLY public hook exported from the kds feature
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { logger } from '@/shared/utils/logger';
import { useKdsOrders } from './queries/useKdsOrders';
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
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ========== QUERIES ==========
  const { orders: initialOrders } = useKdsOrders();

  // ========== STATE ==========
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [orders, setOrdersLocal] = useState<KdsOrder[]>(initialOrders);

  // Sync with fetched orders
  useEffect(() => {
    setOrdersLocal(initialOrders);
  }, [initialOrders]);

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

  const handleAction = useCallback((orderId: string, columnId: string) => {
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

    const newOrder: KdsOrder = {
      ...order,
      status: newStatus,
      startedAt: newStatus === 'preparing' ? new Date().toISOString() : order.startedAt,
      readyAt: newStatus === 'ready' ? new Date().toISOString() : order.readyAt,
      servedAt: newStatus === 'served' ? new Date().toISOString() : order.servedAt,
      servedBy: newStatus === 'served' ? 'KITCHEN' : order.servedBy,
    };

    // Simulate API call
    setTimeout(() => {
      const succeeded = Math.random() < 0.9;
      setLoadingOrderId(null);

      if (succeeded) {
        setOrdersLocal(orders.map((o) => (o.id === orderId ? newOrder : o)));
        setToastMessage(`Order ${orderId} marked as ${newStatus}`);
        setShowSuccessToast(true);

        logger.info('[kds] STATUS_UPDATE_ACTION_SUCCESS', {
          orderId,
          fromStatus: previousStatus,
          toStatus: newStatus,
          itemCount,
        });
      } else {
        setToastMessage(`Failed to mark order ${orderId} as ${newStatus}`);
        setShowErrorToast(true);

        logger.error('[kds] STATUS_UPDATE_ACTION_ERROR', {
          orderId,
          fromStatus: previousStatus,
          toStatus: newStatus,
          itemCount,
          message: 'Status update simulation failed',
        });
      }
    }, 1000);
  }, [orders]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
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
  };
}
