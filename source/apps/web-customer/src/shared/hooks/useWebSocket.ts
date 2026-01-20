/**
 * useWebSocket - React hook for Socket.IO connection management
 * 
 * Manages connection lifecycle and provides event subscription utilities.
 * Also invalidates React Query cache on real-time events for immediate UI updates.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import {
  getSocket,
  disconnectSocket,
  SocketEvents,
  type OrderStatusChangedPayload,
  type PaymentCompletedPayload,
} from '@/lib/websocket';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  /**
   * Tenant ID for the connection
   */
  tenantId: string;
  /**
   * Table ID for customer-specific events
   */
  tableId: string;
  /**
   * Auto-connect on mount
   * @default true
   */
  autoConnect?: boolean;
  /**
   * Callback when order status changes
   */
  onOrderStatusChanged?: (payload: OrderStatusChangedPayload) => void;
  /**
   * Callback when payment is completed
   */
  onPaymentCompleted?: (payload: PaymentCompletedPayload) => void;
}

interface UseWebSocketReturn {
  /**
   * Current connection status
   */
  status: ConnectionStatus;
  /**
   * Whether the socket is connected
   */
  isConnected: boolean;
  /**
   * Connect to the WebSocket server
   */
  connect: () => void;
  /**
   * Disconnect from the WebSocket server
   */
  disconnect: () => void;
  /**
   * Socket instance (for advanced usage)
   */
  socket: Socket | null;
}

/**
 * Hook for managing WebSocket connection for order tracking
 * 
 * @example
 * ```tsx
 * const { status, isConnected } = useWebSocket({
 *   tenantId: 'tenant-123',
 *   tableId: 'table-456',
 *   onOrderStatusChanged: (data) => {
 *     console.log('Order status changed:', data.order.status);
 *   },
 * });
 * ```
 */
export function useWebSocket({
  tenantId,
  tableId,
  autoConnect = true,
  onOrderStatusChanged,
  onPaymentCompleted,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const callbacksRef = useRef({ onOrderStatusChanged, onPaymentCompleted });

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onOrderStatusChanged, onPaymentCompleted };
  }, [onOrderStatusChanged, onPaymentCompleted]);

  const setupEventListeners = useCallback((socket: Socket) => {
    // Connection events
    socket.on('connect', () => {
      console.log('[useWebSocket] Connected');
      setStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[useWebSocket] Disconnected:', reason);
      setStatus('disconnected');
    });

    socket.on('connect_error', () => {
      console.error('[useWebSocket] Connection error');
      setStatus('error');
    });

    socket.on('reconnect', () => {
      console.log('[useWebSocket] Reconnected');
      setStatus('connected');
    });

    // Business events
    socket.on(SocketEvents.ORDER_STATUS_CHANGED, (payload: OrderStatusChangedPayload) => {
      console.log('[useWebSocket] Order status changed:', payload.order.status);
      
      // Invalidate order tracking queries for real-time UI updates
      queryClient.invalidateQueries({ queryKey: ['orderTracking', payload.order.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      callbacksRef.current.onOrderStatusChanged?.(payload);
    });

    socket.on(SocketEvents.PAYMENT_COMPLETED, (payload: PaymentCompletedPayload) => {
      console.log('[useWebSocket] Payment completed:', payload.orderId);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['orderTracking', payload.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      callbacksRef.current.onPaymentCompleted?.(payload);
    });
  }, [queryClient]);

  const connect = useCallback(() => {
    if (!tenantId || !tableId) {
      console.warn('[useWebSocket] Missing tenantId or tableId');
      return;
    }

    const socket = getSocket({
      tenantId,
      tableId,
      role: 'customer',
    });

    if (socket) {
      // Check if already connected BEFORE setting status to connecting
      if (socket.connected) {
        console.log('[useWebSocket] Already connected, updating status immediately');
        socketRef.current = socket;
        setupEventListeners(socket);
        setStatus('connected');
        return;
      }

      // Not yet connected - set connecting status
      setStatus('connecting');
      socketRef.current = socket;
      setupEventListeners(socket);
    }
  }, [tenantId, tableId, setupEventListeners]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      disconnectSocket();
      socketRef.current = null;
      setStatus('disconnected');
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && tenantId && tableId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, tenantId, tableId, connect, disconnect]);

  return {
    status,
    isConnected: status === 'connected',
    connect,
    disconnect,
    socket: socketRef.current,
  };
}

export { SocketEvents };
export type { OrderStatusChangedPayload, PaymentCompletedPayload };
