/**
 * useKdsWebSocket - Real-time WebSocket hook for KDS
 * 
 * Provides:
 * - Real-time new order notifications
 * - Order status change updates
 * - Sound notifications for new orders
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import {
  getSocket,
  disconnectSocket,
  SocketEvents,
  playNewOrderSound,
  type NewOrderPayload,
  type OrderStatusChangedPayload,
  type OrderCancelledPayload,
} from '@/lib/websocket';
import { logger } from '@/shared/utils/logger';
import { getStoredAuthToken } from '@/features/auth/data/tokenStorage';
import { playNotificationSound } from '@/shared/utils/soundNotifications';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseKdsWebSocketOptions {
  /**
   * Tenant ID for WebSocket connection
   */
  tenantId: string;
  /**
   * Enable sound notifications
   * @default true
   */
  soundEnabled?: boolean;
  /**
   * Auto-connect on mount
   * @default true
   */
  autoConnect?: boolean;
  /**
   * Callback when a new order arrives
   */
  onNewOrder?: (order: NewOrderPayload['order']) => void;
  /**
   * Callback when order status changes
   */
  onOrderStatusChanged?: (order: OrderStatusChangedPayload['order']) => void;
  /**
   * Callback when order is cancelled
   */
  onOrderCancelled?: (data: OrderCancelledPayload) => void;
}

interface UseKdsWebSocketReturn {
  /**
   * Current connection status
   */
  status: ConnectionStatus;
  /**
   * Whether WebSocket is connected
   */
  isConnected: boolean;
  /**
   * Count of new orders since last check (for badge)
   */
  newOrderCount: number;
  /**
   * Reset new order count (when user acknowledges)
   */
  resetNewOrderCount: () => void;
  /**
   * Manually connect
   */
  connect: () => void;
  /**
   * Manually disconnect
   */
  disconnect: () => void;
}

/**
 * Hook for KDS real-time updates via WebSocket
 * 
 * @example
 * ```tsx
 * const { isConnected, newOrderCount } = useKdsWebSocket({
 *   tenantId: tenant.id,
 *   soundEnabled: true,
 *   onNewOrder: (order) => {
 *     toast.info(`New order #${order.orderNumber} from ${order.tableName}`);
 *   },
 * });
 * ```
 */
export function useKdsWebSocket({
  tenantId,
  soundEnabled = true,
  autoConnect = true,
  onNewOrder,
  onOrderStatusChanged,
  onOrderCancelled,
}: UseKdsWebSocketOptions): UseKdsWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [newOrderCount, setNewOrderCount] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  
  // Keep callbacks in ref to avoid re-subscriptions
  const callbacksRef = useRef({ onNewOrder, onOrderStatusChanged, onOrderCancelled, soundEnabled });
  useEffect(() => {
    callbacksRef.current = { onNewOrder, onOrderStatusChanged, onOrderCancelled, soundEnabled };
  }, [onNewOrder, onOrderStatusChanged, onOrderCancelled, soundEnabled]);

  const setupEventListeners = useCallback((socket: Socket) => {
    // Connection events
    socket.on('connect', () => {
      logger.info('[websocket] KDS connected', { socketId: socket.id });
      setStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      logger.info('[websocket] KDS disconnected', { reason });
      setStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      logger.error('[websocket] KDS connection error', { error: error.message });
      setStatus('error');
    });

    socket.on('reconnect', () => {
      logger.info('[websocket] KDS reconnected');
      setStatus('connected');
    });

    // ==================== BUSINESS EVENTS ====================

    // New order arrived - DO NOT notify yet (order is PENDING, not sent to kitchen)
    // Notification will trigger when waiter sends to kitchen (status changes to RECEIVED)
    socket.on(SocketEvents.ORDER_NEW, (payload: NewOrderPayload) => {
      logger.info('[websocket] New order created', {
        orderId: payload.order.id,
        orderNumber: payload.order.orderNumber,
        table: payload.order.tableName || payload.order.tableId,
        status: payload.order.status,
      });

      // Just invalidate queries to refresh data, no notification/bell
      queryClient.invalidateQueries({ queryKey: ['kds', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['kds', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    // Order status changed - only notify when waiter sends to kitchen (RECEIVED)
    socket.on(SocketEvents.ORDER_STATUS_CHANGED, (payload: OrderStatusChangedPayload) => {
      logger.info('[websocket] Order status changed', {
        orderId: payload.order.id,
        orderNumber: payload.order.orderNumber,
        status: payload.order.status,
      });

      // Only play sound and show notification when order is sent to kitchen (RECEIVED)
      // This is when waiter confirms the order and it appears in "New" column
      if (payload.order.status === 'RECEIVED' && callbacksRef.current.soundEnabled) {
        playNotificationSound('kds-new-order', 3);
        setNewOrderCount((prev) => prev + 1);
        // Call user callback for toast notification
        callbacksRef.current.onNewOrder?.(payload.order);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['kds', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', payload.order.id] });

      // Call user callback for other status changes
      callbacksRef.current.onOrderStatusChanged?.(payload.order);
    });

    // Order cancelled
    socket.on(SocketEvents.ORDER_CANCELLED, (payload: OrderCancelledPayload) => {
      logger.info('[websocket] Order cancelled', {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        reason: payload.reason,
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['kds', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Call user callback
      callbacksRef.current.onOrderCancelled?.(payload);
    });

    // Order timer update - real-time elapsed time updates
    socket.on(SocketEvents.ORDER_TIMER_UPDATE, (payload: any) => {
      logger.debug('[websocket] Order timer update received', {
        orderId: payload.orderId,
        elapsedMinutes: payload.elapsedMinutes,
        priority: payload.priority,
      });

      // Invalidate orders query to refresh with updated times
      queryClient.invalidateQueries({ queryKey: ['kds', 'orders'] });
    });

  }, [queryClient]);

  const connect = useCallback(() => {
    if (!tenantId) {
      logger.warn('[websocket] Missing tenantId for KDS connection');
      return;
    }

    setStatus('connecting');

    // Get auth token for WebSocket authentication
    const accessToken = getStoredAuthToken();
    if (!accessToken) {
      logger.warn('[websocket] Missing auth token for KDS connection');
    }

    const socket = getSocket({
      tenantId,
      role: 'kitchen',
      accessToken: accessToken || undefined,
    });

    if (socket) {
      socketRef.current = socket;
      setupEventListeners(socket);

      if (socket.connected) {
        setStatus('connected');
      }
    }
  }, [tenantId, setupEventListeners]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      disconnectSocket();
      socketRef.current = null;
      setStatus('disconnected');
    }
  }, []);

  const resetNewOrderCount = useCallback(() => {
    setNewOrderCount(0);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && tenantId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, tenantId, connect, disconnect]);

  return {
    status,
    isConnected: status === 'connected',
    newOrderCount,
    resetNewOrderCount,
    connect,
    disconnect,
  };
}
