/**
 * useWaiterWebSocket - Real-time WebSocket hook for Waiter Service Board
 * 
 * Provides:
 * - New order notifications with sound alerts
 * - Order status changes (kitchen ready notifications)
 * - Table status updates
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
  type BillRequestedPayload,
} from '@/lib/websocket';
import { logger } from '@/shared/utils/logger';
import { getStoredAuthToken } from '@/features/auth/data/tokenStorage';
import { playNotificationSound } from '@/shared/utils/soundNotifications';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface TableStatusPayload {
  tableId: string;
  tableName: string;
  status: string;
  sessionId?: string;
  timestamp: Date;
}

interface UseWaiterWebSocketOptions {
  /**
   * Tenant ID for WebSocket connection
   */
  tenantId: string;
  /**
   * Enable sound notifications for new orders
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
   * Callback when order status changes (e.g., kitchen ready)
   */
  onOrderStatusChanged?: (order: OrderStatusChangedPayload['order']) => void;
  /**
   * Callback when table status changes
   */
  onTableStatusChanged?: (data: TableStatusPayload) => void;
  /**
   * Callback when customer requests bill
   */
  onBillRequested?: (data: BillRequestedPayload) => void;
}

interface UseWaiterWebSocketReturn {
  /**
   * Current connection status
   */
  status: ConnectionStatus;
  /**
   * Whether WebSocket is connected
   */
  isConnected: boolean;
  /**
   * Count of new orders since last check
   */
  newOrderCount: number;
  /**
   * Count of ready orders (kitchen finished)
   */
  readyOrderCount: number;
  /**
   * Count of bill requests from customers
   */
  billRequestCount: number;
  /**
   * Reset new order count
   */
  resetNewOrderCount: () => void;
  /**
   * Reset ready order count
   */
  resetReadyOrderCount: () => void;
  /**
   * Reset bill request count
   */
  resetBillRequestCount: () => void;
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
 * Hook for Waiter Service Board real-time updates via WebSocket
 * 
 * @example
 * ```tsx
 * const { isConnected, newOrderCount, readyOrderCount } = useWaiterWebSocket({
 *   tenantId: tenant.id,
 *   soundEnabled: true,
 *   onNewOrder: (order) => {
 *     toast.info(`New order #${order.orderNumber}`);
 *   },
 *   onOrderStatusChanged: (order) => {
 *     if (order.status === 'ready') {
 *       toast.success(`Order #${order.orderNumber} is ready!`);
 *     }
 *   },
 * });
 * ```
 */
export function useWaiterWebSocket({
  tenantId,
  soundEnabled = true,
  autoConnect = true,
  onNewOrder,
  onOrderStatusChanged,
  onTableStatusChanged,
  onBillRequested,
}: UseWaiterWebSocketOptions): UseWaiterWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [readyOrderCount, setReadyOrderCount] = useState(0);
  const [billRequestCount, setBillRequestCount] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  
  const callbacksRef = useRef({ 
    onNewOrder, 
    onOrderStatusChanged, 
    onTableStatusChanged,
    onBillRequested,
    soundEnabled 
  });
  
  useEffect(() => {
    callbacksRef.current = { 
      onNewOrder, 
      onOrderStatusChanged, 
      onTableStatusChanged,
      onBillRequested,
      soundEnabled 
    };
  }, [onNewOrder, onOrderStatusChanged, onTableStatusChanged, onBillRequested, soundEnabled]);

  const setupEventListeners = useCallback((socket: Socket) => {
    // Connection events
    socket.on('connect', () => {
      logger.info('[websocket] Waiter service connected', { socketId: socket.id });
      setStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      logger.info('[websocket] Waiter service disconnected', { reason });
      setStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      logger.error('[websocket] Waiter connection error', { error: error.message });
      setStatus('error');
    });

    socket.on('reconnect', () => {
      logger.info('[websocket] Waiter service reconnected');
      setStatus('connected');
    });

    // New order arrived
    socket.on(SocketEvents.ORDER_NEW, (payload: NewOrderPayload) => {
      logger.info('[websocket] Waiter: new order', {
        orderId: payload.order.id,
        orderNumber: payload.order.orderNumber,
        table: payload.order.tableName || payload.order.tableId,
      });

      // Play sound notification (3 beeps for new order)
      if (callbacksRef.current.soundEnabled) {
        playNotificationSound('waiter-new-order', 3);
      }

      // Increment badge count
      setNewOrderCount((prev) => prev + 1);

      // Invalidate service orders query
      queryClient.invalidateQueries({ queryKey: ['waiter', 'service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables', 'overview'] });

      // Call user callback
      callbacksRef.current.onNewOrder?.(payload.order);
    });

    // Order status changed (including kitchen ready)
    socket.on(SocketEvents.ORDER_STATUS_CHANGED, (payload: OrderStatusChangedPayload) => {
      logger.info('[websocket] Waiter: order status changed', {
        orderId: payload.order.id,
        orderNumber: payload.order.orderNumber,
        status: payload.order.status,
      });

      // Track ready orders
      if (payload.order.status === 'ready') {
        setReadyOrderCount((prev) => prev + 1);
        
        // Play different sound for ready orders (2 beeps)
        if (callbacksRef.current.soundEnabled) {
          playNotificationSound('waiter-new-order', 2);
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['waiter', 'service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables', 'overview'] });

      // Call user callback
      callbacksRef.current.onOrderStatusChanged?.(payload.order);
    });

    // Table status changed
    socket.on(SocketEvents.TABLE_STATUS_CHANGED, (payload: TableStatusPayload) => {
      logger.info('[websocket] Waiter: table status changed', {
        tableId: payload.tableId,
        tableName: payload.tableName,
        status: payload.status,
      });

      // Invalidate tables query
      queryClient.invalidateQueries({ queryKey: ['tables', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });

      // Call user callback
      callbacksRef.current.onTableStatusChanged?.(payload);
    });

    // Table session events
    socket.on(SocketEvents.TABLE_SESSION_STARTED, (payload: TableStatusPayload) => {
      logger.info('[websocket] Waiter: table session started', { tableId: payload.tableId });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    });

    socket.on(SocketEvents.TABLE_SESSION_ENDED, (payload: TableStatusPayload) => {
      logger.info('[websocket] Waiter: table session ended', { tableId: payload.tableId });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    });

    // Bill requested by customer
    socket.on(SocketEvents.BILL_REQUESTED, (payload: BillRequestedPayload) => {
      logger.info('[websocket] Waiter: bill requested', {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        tableNumber: payload.tableNumber,
        totalAmount: payload.totalAmount,
      });

      // Play notification sound (4 beeps for bill request - urgent attention)
      if (callbacksRef.current.soundEnabled) {
        playNotificationSound('waiter-new-order', 4);
      }

      // Increment badge count
      setBillRequestCount((prev) => prev + 1);

      // Invalidate service orders and tables queries
      queryClient.invalidateQueries({ queryKey: ['waiter', 'service-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });

      // Call user callback
      callbacksRef.current.onBillRequested?.(payload);
    });

  }, [queryClient]);

  const connect = useCallback(() => {
    if (!tenantId) {
      logger.warn('[websocket] Missing tenantId for waiter connection');
      return;
    }

    setStatus('connecting');

    const accessToken = getStoredAuthToken();
    if (!accessToken) {
      logger.warn('[websocket] Missing auth token for waiter connection');
    }

    const socket = getSocket({
      tenantId,
      role: 'staff',
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

  const resetReadyOrderCount = useCallback(() => {
    setReadyOrderCount(0);
  }, []);

  const resetBillRequestCount = useCallback(() => {
    setBillRequestCount(0);
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
    readyOrderCount,
    billRequestCount,
    resetNewOrderCount,
    resetReadyOrderCount,
    resetBillRequestCount,
    connect,
    disconnect,
  };
}
