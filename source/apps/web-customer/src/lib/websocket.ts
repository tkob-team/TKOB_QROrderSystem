/**
 * WebSocket Client for Real-time Order Updates
 * 
 * Connects to backend Socket.IO server for:
 * - Order status changes
 * - Payment completion notifications
 */

import { io, Socket } from 'socket.io-client';

// Socket.IO events from backend
export const SocketEvents = {
  // Server -> Client events
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_NEW: 'order.new',
  ORDER_TIMER_UPDATE: 'order:timer_update',
  ORDER_LIST_UPDATE: 'order:list_update',
  PAYMENT_COMPLETED: 'payment:completed',
  
  // Client -> Server events (subscriptions)
  SUBSCRIBE_CUSTOMER: 'subscribe:customer',
  SUBSCRIBE_STAFF: 'subscribe:staff',
} as const;

export interface OrderStatusChangedPayload {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    tableId: string;
    items: unknown[];
  };
  timestamp: Date;
}

export interface PaymentCompletedPayload {
  orderId: string;
  paymentId: string;
  timestamp: Date;
}

export interface SocketConnectionOptions {
  tenantId: string;
  tableId: string;
  role?: 'customer' | 'staff';
}

let socketInstance: Socket | null = null;

/**
 * Get or create Socket.IO connection
 */
export function getSocket(options?: SocketConnectionOptions): Socket | null {
  // Return existing instance if available
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // WebSocket connects to base URL (not /api/v1 - socket.io uses root path)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Remove /api/v1 suffix if present for socket connection
  const wsUrl = baseUrl.replace(/\/api\/v1$/, '');
  
  if (!options) {
    // Return null if no options and no existing connection
    return socketInstance;
  }

  const { tenantId, tableId, role = 'customer' } = options;

  // Create new connection (socket.io connects to namespace at root level)
  socketInstance = io(`${wsUrl}/orders`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    query: {
      tenantId,
      tableId,
      role,
    },
  });

  // Connection event handlers
  socketInstance.on('connect', () => {
    console.log('[WebSocket] Connected:', socketInstance?.id);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('[WebSocket] Disconnected:', reason);
  });

  socketInstance.on('connect_error', (error) => {
    console.error('[WebSocket] Connection error:', error.message);
  });

  socketInstance.on('reconnect', (attemptNumber) => {
    console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts');
  });

  socketInstance.on('reconnect_attempt', (attemptNumber) => {
    console.log('[WebSocket] Reconnection attempt:', attemptNumber);
  });

  socketInstance.on('reconnect_failed', () => {
    console.error('[WebSocket] Reconnection failed');
  });

  return socketInstance;
}

/**
 * Disconnect and cleanup socket
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
    console.log('[WebSocket] Disconnected and cleaned up');
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socketInstance?.connected ?? false;
}
