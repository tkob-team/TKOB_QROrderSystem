/**
 * useOrderRealtimeUpdates - Hook for real-time order status updates
 * 
 * Combines polling with WebSocket for reliable order tracking:
 * - WebSocket provides instant updates when connected
 * - Polling serves as fallback when WebSocket is unavailable
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket, type OrderStatusChangedPayload, type PaymentCompletedPayload } from '@/shared/hooks/useWebSocket';
import { useOrderStore } from '@/stores/order.store';
import { log } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';

interface UseOrderRealtimeUpdatesOptions {
  /**
   * Tenant ID (required for WebSocket connection)
   */
  tenantId: string;
  /**
   * Table ID (required for WebSocket connection)
   */
  tableId: string;
  /**
   * Order ID to track (for filtering events)
   */
  orderId?: string;
  /**
   * Enable WebSocket connection
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback when order status changes
   */
  onStatusChange?: (status: string, orderId: string) => void;
  /**
   * Callback when payment is completed
   */
  onPaymentComplete?: (orderId: string) => void;
}

interface UseOrderRealtimeUpdatesReturn {
  /**
   * Whether WebSocket is connected
   */
  isRealtimeConnected: boolean;
  /**
   * Connection status
   */
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  /**
   * Manually reconnect WebSocket
   */
  reconnect: () => void;
}

/**
 * Hook for real-time order updates via WebSocket
 * 
 * @example
 * ```tsx
 * const { isRealtimeConnected } = useOrderRealtimeUpdates({
 *   tenantId: session.tenantId,
 *   tableId: session.tableId,
 *   orderId: currentOrderId,
 *   onStatusChange: (status) => {
 *     toast.info(`Order status: ${status}`);
 *   },
 *   onPaymentComplete: () => {
 *     router.push('/orders/confirmation');
 *   },
 * });
 * ```
 */
export function useOrderRealtimeUpdates({
  tenantId,
  tableId,
  orderId,
  enabled = true,
  onStatusChange,
  onPaymentComplete,
}: UseOrderRealtimeUpdatesOptions): UseOrderRealtimeUpdatesReturn {
  const queryClient = useQueryClient();
  const setPaymentStatus = useOrderStore((s) => s.setPaymentStatus);

  // Handle order status changed event
  const handleOrderStatusChanged = useCallback(
    (payload: OrderStatusChangedPayload) => {
      const { order, timestamp } = payload;

      log('realtime', 'Order status changed via WebSocket', {
        orderId: maskId(order.id),
        status: order.status,
        orderNumber: order.orderNumber,
        timestamp: timestamp,
      }, { feature: 'orders' });

      // Only process if this is the order we're tracking (or tracking all)
      if (!orderId || order.id === orderId) {
        // Invalidate queries to refetch latest data
        queryClient.invalidateQueries({ queryKey: ['orderTracking', order.id] });
        queryClient.invalidateQueries({ queryKey: ['order', order.id] });

        // Call user callback
        onStatusChange?.(order.status, order.id);
      }
    },
    [orderId, queryClient, onStatusChange]
  );

  // Handle payment completed event
  const handlePaymentCompleted = useCallback(
    (payload: PaymentCompletedPayload) => {
      const { orderId: paidOrderId, paymentId } = payload;

      log('realtime', 'Payment completed via WebSocket', {
        orderId: maskId(paidOrderId),
        paymentId: maskId(paymentId),
      }, { feature: 'orders' });

      // Only process if this is the order we're tracking
      if (!orderId || paidOrderId === orderId) {
        // Update local state
        setPaymentStatus('SUCCESS', paidOrderId);

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['orderTracking', paidOrderId] });
        queryClient.invalidateQueries({ queryKey: ['payment', paymentId] });

        // Call user callback
        onPaymentComplete?.(paidOrderId);
      }
    },
    [orderId, queryClient, setPaymentStatus, onPaymentComplete]
  );

  // Setup WebSocket connection
  const { status, isConnected, connect } = useWebSocket({
    tenantId,
    tableId,
    autoConnect: enabled && !!tenantId && !!tableId,
    onOrderStatusChanged: handleOrderStatusChanged,
    onPaymentCompleted: handlePaymentCompleted,
  });

  // Log connection status changes
  useEffect(() => {
    log('realtime', 'WebSocket connection status', {
      status,
      tenantId: maskId(tenantId),
      tableId: maskId(tableId),
    }, { feature: 'orders', dedupe: true, dedupeTtlMs: 5000 });
  }, [status, tenantId, tableId]);

  return {
    isRealtimeConnected: isConnected,
    connectionStatus: status,
    reconnect: connect,
  };
}
