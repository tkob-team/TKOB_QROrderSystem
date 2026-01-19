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

    // New order arrived
    socket.on(SocketEvents.ORDER_NEW, (payload: NewOrderPayload) => {
      logger.info('[websocket] New order received', {
        orderId: payload.order.id,
        orderNumber: payload.order.orderNumber,
        table: payload.order.tableName || payload.order.tableId,
      });

      // Play sound notification (3 beeps for new KDS order)
      if (callbacksRef.current.soundEnabled) {
        playNotificationSound('kds-new-order', 3);
      }

      // Increment badge count
      setNewOrderCount((prev) => prev + 1);

      // Invalidate KDS queries to refetch orders
      queryClient.invalidateQueries({ queryKey: ['kds', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['kds', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Call user callback
      callbacksRef.current.onNewOrder?.(payload.order);
    });

    // Order status changed
    socket.on(SocketEvents.ORDER_STATUS_CHANGED, (payload: OrderStatusChangedPayload) => {
      logger.info('[websocket] Order status changed', {
        orderId: payload.order.id,
        orderNumber: payload.order.orderNumber,
        status: payload.order.status,
      });

      // Play sound when order moves to RECEIVED (sent to kitchen by waiter)
      // This is the "new order" event for KDS
      if (payload.order.status === 'RECEIVED' && callbacksRef.current.soundEnabled) {
        playNotificationSound('kds-new-order', 3);
        setNewOrderCount((prev) => prev + 1);
      }


      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['kds', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', payload.order.id] });

      // Call user callback
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
