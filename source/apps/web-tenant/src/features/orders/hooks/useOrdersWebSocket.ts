/**
 * useOrdersWebSocket - Real-time WebSocket hook for Orders Management
 * 
 * Similar to useKdsWebSocket but for the Orders page
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

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseOrdersWebSocketOptions {
  /**
   * Tenant ID for WebSocket connection
   */
  tenantId: string;
  /**
   * Enable sound notifications for new orders
   * @default false
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

interface UseOrdersWebSocketReturn {
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
   * Reset new order count
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
 * Hook for Orders page real-time updates via WebSocket
 */
export function useOrdersWebSocket({
  tenantId,
  soundEnabled = false,
  autoConnect = true,
  onNewOrder,
  onOrderStatusChanged,
  onOrderCancelled,
}: UseOrdersWebSocketOptions): UseOrdersWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [newOrderCount, setNewOrderCount] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  
  const callbacksRef = useRef({ onNewOrder, onOrderStatusChanged, onOrderCancelled, soundEnabled });
  useEffect(() => {
    callbacksRef.current = { onNewOrder, onOrderStatusChanged, onOrderCancelled, soundEnabled };
  }, [onNewOrder, onOrderStatusChanged, onOrderCancelled, soundEnabled]);

  const setupEventListeners = useCallback((socket: Socket) => {
    socket.on('connect', () => {
      logger.info('[websocket] Orders page connected', { socketId: socket.id });
      setStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      logger.info('[websocket] Orders page disconnected', { reason });
      setStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      logger.error('[websocket] Orders connection error', { error: error.message });
      setStatus('error');
    });

    socket.on('reconnect', () => {
      logger.info('[websocket] Orders page reconnected');
      setStatus('connected');
    });

    // New order arrived
    socket.on(SocketEvents.ORDER_NEW, (payload: NewOrderPayload) => {
      logger.info('[websocket] New order for orders page', {
        orderId: payload.order.id,
        orderNumber: payload.order.orderNumber,
      });

      if (callbacksRef.current.soundEnabled) {
        playNewOrderSound();
      }

      setNewOrderCount((prev) => prev + 1);

      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      callbacksRef.current.onNewOrder?.(payload.order);
    });

    // Order status changed
    socket.on(SocketEvents.ORDER_STATUS_CHANGED, (payload: OrderStatusChangedPayload) => {
      logger.info('[websocket] Order status changed', {
        orderId: payload.order.id,
        status: payload.order.status,
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', payload.order.id] });

      callbacksRef.current.onOrderStatusChanged?.(payload.order);
    });

    // Order cancelled
    socket.on(SocketEvents.ORDER_CANCELLED, (payload: OrderCancelledPayload) => {
      logger.info('[websocket] Order cancelled', {
        orderId: payload.orderId,
        reason: payload.reason,
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });

      callbacksRef.current.onOrderCancelled?.(payload);
    });
  }, [queryClient]);

  const connect = useCallback(() => {
    if (!tenantId) {
      logger.warn('[websocket] Missing tenantId for orders connection');
      return;
    }

    setStatus('connecting');

    const socket = getSocket({
      tenantId,
      role: 'staff',
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
