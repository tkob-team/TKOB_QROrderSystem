/**
 * WebSocket Client for Real-time Kitchen/Order Updates
 * 
 * Connects to backend Socket.IO server for:
 * - New order notifications
 * - Order status changes
 * - Order timer updates
 */

import { io, Socket } from 'socket.io-client';
import { logger } from '@/shared/utils/logger';

// Socket.IO events from backend
export const SocketEvents = {
  // Server -> Client events
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_NEW: 'order.new',
  ORDER_TIMER_UPDATE: 'order:timer_update',
  ORDER_LIST_UPDATE: 'order:list_update',
  PAYMENT_COMPLETED: 'payment:completed',
  ORDER_CANCELLED: 'order:cancelled',
  BILL_REQUESTED: 'order:bill_requested',
  
  // Table events
  TABLE_STATUS_CHANGED: 'table.status_changed',
  TABLE_SESSION_STARTED: 'table.session_started',
  TABLE_SESSION_ENDED: 'table.session_ended',
  
  // Table events
  TABLE_STATUS_CHANGED: 'table.status_changed',
  TABLE_SESSION_STARTED: 'table.session_started',
  TABLE_SESSION_ENDED: 'table.session_ended',
  
  // Client -> Server events (subscriptions)
  SUBSCRIBE_STAFF: 'subscribe:staff',
  SUBSCRIBE_CUSTOMER: 'subscribe:customer',
} as const;

// ==================== PAYLOAD TYPES ====================

export interface OrderPayload {
  id: string;
  orderNumber: string;
  status: string;
  tableId: string;
  tableName?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    notes?: string;
  }>;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  customerName?: string;
}

export interface NewOrderPayload {
  order: OrderPayload;
  timestamp: Date;
}

export interface OrderStatusChangedPayload {
  order: OrderPayload;
  timestamp: Date;
}

export interface OrderTimerUpdatePayload {
  orderId: string;
  elapsedMinutes: number;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  timestamp: Date;
}

export interface OrderListUpdatePayload {
  orders: OrderPayload[];
  timestamp: Date;
}

export interface OrderCancelledPayload {
  orderId: string;
  orderNumber: string;
  reason?: string;
  timestamp: Date;
}

export interface BillRequestedPayload {
  orderId: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  totalAmount: number;
  requestedAt: Date;
}

export interface BillRequestedPayload {
  orderId: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  totalAmount: number;
  requestedAt: Date;
}

// ==================== CONNECTION MANAGEMENT ====================

export interface SocketConnectionOptions {
  tenantId: string;
  role: 'staff' | 'kitchen';
  accessToken?: string;
}

let socketInstance: Socket | null = null;

/**
 * Get or create Socket.IO connection for staff/kitchen
 */
export function getSocket(options?: SocketConnectionOptions): Socket | null {
  // Return existing instance if available
  if (socketInstance?.connected) {
    return socketInstance;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  if (!options) {
    return socketInstance;
  }

  const { tenantId, role, accessToken } = options;

  // Create new connection
  socketInstance = io(`${baseUrl}/orders`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    auth: accessToken ? { token: accessToken } : undefined,
    query: {
      tenantId,
      role,
    },
  });

  // Connection event handlers
  socketInstance.on('connect', () => {
    logger.info('[WebSocket] Staff connected:', socketInstance?.id);
    
    // Subscribe to staff room
    socketInstance?.emit(SocketEvents.SUBSCRIBE_STAFF, { tenantId });
  });

  socketInstance.on('disconnect', (reason) => {
    logger.info('[WebSocket] Staff disconnected:', reason);
  });

  socketInstance.on('connect_error', (error) => {
    logger.error('[WebSocket] Connection error:', error.message);
  });

  socketInstance.on('reconnect', (attemptNumber) => {
    logger.info('[WebSocket] Staff reconnected after', attemptNumber, 'attempts');
    
    // Re-subscribe to staff room after reconnection
    socketInstance?.emit(SocketEvents.SUBSCRIBE_STAFF, { tenantId });
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
    logger.info('[WebSocket] Staff disconnected and cleaned up');
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socketInstance?.connected ?? false;
}

// ==================== SOUND UTILITIES ====================

let audioContext: AudioContext | null = null;
let audioInitialized = false;

/**
 * Initialize audio context (must be called from user gesture)
 * Call this on page load or first user interaction
 */
export async function initializeAudio(): Promise<boolean> {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    audioInitialized = true;
    return true;
  } catch (error) {
    console.error('[audio] Failed to initialize AudioContext:', error);
    return false;
  }
}

/**
 * Play notification sound for new orders
 * Uses Web Audio API for reliable sound playback
 * Note: AudioContext must be initialized first via user gesture (call initializeAudio())
 */
export function playNewOrderSound(): void {
  try {
    // Check if audio is initialized
    if (!audioContext || !audioInitialized) {
      console.warn('[audio] AudioContext not initialized. Call initializeAudio() from user gesture first.');
      return;
    }

    // Resume if suspended (can happen on page visibility change)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch((err) => {
        console.error('[audio] Failed to resume AudioContext:', err);
      });
    }

    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure sound (pleasant notification beep)
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    // Volume envelope
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Play a second beep for emphasis
    setTimeout(() => {
      if (audioContext && audioContext.state === 'running') {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      }
    }, 200);

  } catch (error) {
    logger.error('[WebSocket] Failed to play notification sound:', error);
  }
}
