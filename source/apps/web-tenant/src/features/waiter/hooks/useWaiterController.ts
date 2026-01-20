'use client';

/**
 * Waiter Controller Hook - Public API
 * Manages all state and actions for Service Board
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { useServiceOrders } from './queries';
import { sortOrdersByStatus } from '../utils';
import type { 
  ServiceOrder, 
  OrderStatus, 
  ServiceTabCounts,
  TableOrdersGroup,
  CloseTableData 
} from '../model/types';
import { logger } from '@/shared/utils/logger';
import { orderControllerUpdateOrderStatus } from '@/services/generated/orders/orders';
import { api as axiosInstance } from '@/services/axios';
import type { UpdateOrderStatusDtoStatus } from '@/services/generated/models';
import { useWaiterWebSocket } from './useWaiterWebSocket';
import type { BillRequest } from '../ui/components/modals/BillRequestsDialog';

interface WaiterState {
  // Data
  orders: ServiceOrder[];
  isLoading: boolean;
  error: Error | null;
  
  // UI State
  activeTab: OrderStatus;
  expandedOrders: Set<string>;
  
  // WebSocket
  isConnected: boolean;
  billRequestCount: number;
  billRequests: BillRequest[]; // List of pending bill requests
  showBillRequestsDialog: boolean;
  
  // Derived
  currentOrders: ServiceOrder[];
  tabCounts: ServiceTabCounts;
  ordersByTable: TableOrdersGroup[]; // Grouped orders for completed tab
  
  // Toast
  showSuccessToast: boolean;
  toastMessage: string;
}

interface WaiterActions {
  // Tab
  setActiveTab: (tab: OrderStatus) => void;
  
  // Order actions
  acceptOrder: (order: ServiceOrder) => void;
  rejectOrder: (order: ServiceOrder) => void;
  cancelOrder: (order: ServiceOrder) => void;
  markServed: (order: ServiceOrder) => void;
  markCompleted: (order: ServiceOrder) => void;
  markPaid: (order: ServiceOrder) => void;
  markTableAsPaid: (tableGroup: TableOrdersGroup) => Promise<void>; // Mark all orders in table as paid
  closeTable: (data: CloseTableData) => Promise<void>; // Updated signature
  toggleOrderExpanded: (orderId: string) => void;
  resetBillRequestCount: () => void;
  
  // Bill request actions
  openBillRequestsDialog: () => void;
  closeBillRequestsDialog: () => void;
  handleBillRequestHandled: (requestId: string) => void;
  
  // UI actions
  refresh: () => void;
  manualOrder: () => void;
  closeToast: () => void;
  handleLogout: () => void;
}

export interface UseWaiterControllerReturn {
  state: WaiterState;
  actions: WaiterActions;
}

export function useWaiterController(): UseWaiterControllerReturn {
  // Router and Auth
  const router = useRouter();
  const { logout, user } = useAuth();
  
  // Data from query hook
  const { data: fetchedOrders = [], isLoading, error, refetch } = useServiceOrders();
  
  // Bill requests state
  const [billRequests, setBillRequests] = useState<BillRequest[]>([]);
  const [showBillRequestsDialog, setShowBillRequestsDialog] = useState(false);
  
  // WebSocket for real-time updates
  const { isConnected, billRequestCount, resetBillRequestCount } = useWaiterWebSocket({
    tenantId: user?.tenantId || '',
    soundEnabled: true, // Always enabled
    onNewOrder: () => refetch(),
    onOrderStatusChanged: () => refetch(),
    onBillRequested: (data) => {
      // Add to bill requests list
      const newRequest: BillRequest = {
        id: data.orderId, // sessionId from backend
        tableId: data.tableId,
        tableNumber: data.tableNumber,
        totalAmount: data.totalAmount,
        orderCount: (data as any).orderCount || 1,
        requestedAt: data.requestedAt,
      };
      
      setBillRequests(prev => {
        // Check if request already exists (by id)
        const exists = prev.some(r => r.id === newRequest.id);
        if (exists) return prev;
        return [...prev, newRequest];
      });
      
      // Show toast notification for bill request
      setToastMessage(`Table ${data.tableNumber} requested bill - $${data.totalAmount.toFixed(2)}`);
      setShowSuccessToast(true);
      refetch();
    },
  });
  
  // Local state for orders (for optimistic updates)
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<OrderStatus>('ready');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync fetched orders to local state (only when content actually changes)
  useEffect(() => {
    // Compare by JSON string to avoid infinite loop from reference changes
    const fetchedJson = JSON.stringify(fetchedOrders.map(o => o.id + o.status + o.paymentStatus));
    const localJson = JSON.stringify(orders.map(o => o.id + o.status + o.paymentStatus));
    if (fetchedJson !== localJson) {
      setOrders(fetchedOrders);
    }
  }, [fetchedOrders, orders]);



  // Derived values
  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  }, [orders]);

  const tabCounts: ServiceTabCounts = useMemo(() => {
    const counts = {
      placed: getOrdersByStatus('placed').length,
      confirmed: getOrdersByStatus('confirmed').length,
      preparing: getOrdersByStatus('preparing').length,
      ready: getOrdersByStatus('ready').length,
      served: getOrdersByStatus('served').length,
      completed: getOrdersByStatus('completed').length,
    };

    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      logger.info('[ui] TAB_COUNTS_COMPUTED', {
        feature: 'waiter',
        entity: 'tabCounts',
        counts,
      });
    }

    return counts;
  }, [getOrdersByStatus]);

  const currentOrders = useMemo(() => {
    const sorted = sortOrdersByStatus(orders, activeTab);
    
    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      logger.info('[ui] TAB_ORDERS_APPLIED', {
        feature: 'waiter',
        entity: 'currentOrders',
        activeTab,
        inputCount: orders.length,
        outputCount: sorted.length,
        sample: process.env.NEXT_PUBLIC_LOG_DATA === 'true' && sorted[0]
          ? {
              orderNumber: sorted[0].orderNumber,
              table: sorted[0].table,
              status: sorted[0].status,
              itemsCount: sorted[0].items?.length || 0,
              total: sorted[0].total,
            }
          : undefined,
      });
    }
    
    return sorted;
  }, [orders, activeTab]);

  // Group orders by table (for completed tab)
  const ordersByTable = useMemo(() => {
    // Group all completed/served orders (both paid and unpaid)
    // They will disappear only after Close Table action (when status changes or bill is generated)
    const completedOrders = orders.filter(order => 
      order.status === 'completed' || order.status === 'served'
    );
    
    const grouped = new Map<string, TableOrdersGroup>();
    
    completedOrders.forEach(order => {
      // Create unique key from tableId + sessionId
      const key = `${order.tableId}-${order.sessionId || 'no-session'}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          tableId: order.tableId,
          tableNumber: order.table,
          sessionId: order.sessionId || '',
          orders: [],
          totalAmount: 0,
        });
      }
      
      const group = grouped.get(key)!;
      group.orders.push(order);
      group.totalAmount += order.total;
    });
    
    // Convert to array and sort by table number
    return Array.from(grouped.values()).sort((a, b) => 
      a.tableNumber.localeCompare(b.tableNumber)
    );
  }, [orders]);

  // Logout handler
  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
  }, [logout, router]);

  /**
   * Update order status via API with optimistic update
   * 
   * @param orderId - Order to update
   * @param newWaiterStatus - Target waiter UI status (for optimistic update)
   * @param backendStatus - Actual backend status to send to API
   * @param successMessage - Toast message on success
   * @param notes - Optional notes for status history
   */
  const updateOrderStatusApi = useCallback(async (
    orderId: string,
    newWaiterStatus: OrderStatus,
    backendStatus: UpdateOrderStatusDtoStatus,
    successMessage: string,
    notes?: string
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      logger.warn('[waiter] ORDER_NOT_FOUND', { orderId });
      return;
    }

    const previousStatus = order.status;

    logger.info('[waiter] UPDATE_STATUS_ATTEMPT', {
      orderId,
      orderNumber: order.orderNumber,
      fromStatus: previousStatus,
      toWaiterStatus: newWaiterStatus,
      toBackendStatus: backendStatus,
    });

    // Optimistic update
    setOrders(prev =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newWaiterStatus } : o))
    );
    setToastMessage(successMessage);
    setShowSuccessToast(true);

    try {
      // Call API
      await orderControllerUpdateOrderStatus(orderId, {
        status: backendStatus,
        notes,
      });

      logger.info('[waiter] UPDATE_STATUS_SUCCESS', {
        orderId,
        orderNumber: order.orderNumber,
        newStatus: backendStatus,
      });

      // Refetch to sync with backend and trigger WebSocket broadcast
      refetch();
    } catch (error) {
      // Revert optimistic update on error
      setOrders(prev =>
        prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o))
      );
      setToastMessage(`Failed to update ${order.orderNumber}`);
      setShowSuccessToast(true);

      logger.error('[waiter] UPDATE_STATUS_ERROR', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [orders, refetch]);

  // Actions
  const actions: WaiterActions = {
    setActiveTab,
    
    acceptOrder: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] ACCEPT_ORDER_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'confirmed',
      });
      // Accept = confirm order = move to RECEIVED
      // Backend flow: PENDING -> RECEIVED (waiter confirmed) -> PREPARING (kitchen started)
      // Waiter UI: placed -> confirmed (shows in "Confirmed" tab, sent to KDS)
      await updateOrderStatusApi(
        order.id,
        'confirmed',     // waiter UI status
        'RECEIVED',      // backend status - waiter confirmed, ready for kitchen
        `${order.orderNumber} accepted and sent to kitchen`,
        'Confirmed by waiter'
      );
    }, [updateOrderStatusApi]),
    
    rejectOrder: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] REJECT_ORDER_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'completed',
      });
      // Use cancel API for rejection
      try {
        await axiosInstance.post(`/api/v1/admin/orders/${order.id}/cancel`, { reason: 'Rejected by waiter' });
        setOrders(prev => prev.filter(o => o.id !== order.id)); // Remove from list
        setToastMessage(`${order.orderNumber} rejected`);
        setShowSuccessToast(true);
        refetch();
      } catch (error) {
        logger.error('[waiter] REJECT_ORDER_ERROR', { orderId: order.id, error });
        setToastMessage(`Failed to reject ${order.orderNumber}`);
        setShowSuccessToast(true);
      }
    }, [refetch]),
    
    cancelOrder: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] CANCEL_ORDER_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'completed',
      });
      try {
        await axiosInstance.post(`/api/v1/admin/orders/${order.id}/cancel`, { reason: 'Cancelled by waiter' });
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setToastMessage(`${order.orderNumber} cancelled`);
        setShowSuccessToast(true);
        refetch();
      } catch (error) {
        logger.error('[waiter] CANCEL_ORDER_ERROR', { orderId: order.id, error });
        setToastMessage(`Failed to cancel ${order.orderNumber}`);
        setShowSuccessToast(true);
      }
    }, [refetch]),
    
    markServed: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] MARK_SERVED_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'served',
      });
      await updateOrderStatusApi(
        order.id,
        'served',        // waiter UI status  
        'SERVED',        // backend status
        `${order.orderNumber} marked as served`,
        'Served by waiter'
      );
    }, [updateOrderStatusApi]),
    
    markCompleted: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] MARK_COMPLETED_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'completed',
      });
      await updateOrderStatusApi(
        order.id,
        'completed',     // waiter UI status
        'COMPLETED',     // backend status
        `${order.orderNumber} marked as completed`,
        'Completed'
      );
    }, [updateOrderStatusApi]),
    
    markPaid: useCallback(async (order: ServiceOrder) => {
      try {
        logger.info('[waiter] MARK_PAID_ACTION_ATTEMPT', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          table: order.table,
          previousPaymentStatus: order.paymentStatus,
        });
        
        // Optimistic update
        setOrders(prev => 
          prev.map((o) => (o.id === order.id ? { ...o, paymentStatus: 'paid' } : o))
        );
        
        // Call API
        const axiosInstance = (await import('@/services/axios')).default;
        await axiosInstance.patch(`/api/v1/admin/orders/${order.id}/mark-paid`);
        
        // Refetch to sync with backend
        refetch();
        
        setToastMessage(`${order.orderNumber} payment marked as complete`);
        setShowSuccessToast(true);
        
        logger.info('[waiter] MARK_PAID_ACTION_SUCCESS', {
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
      } catch (error) {
        // Revert optimistic update on error
        setOrders(prev => 
          prev.map((o) => (o.id === order.id ? { ...o, paymentStatus: order.paymentStatus } : o))
        );
        
        setToastMessage(`Failed to mark ${order.orderNumber} as paid`);
        setShowSuccessToast(true);
        
        logger.error('[waiter] MARK_PAID_ACTION_ERROR', {
          orderId: order.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, [refetch]),    
    markTableAsPaid: useCallback(async (tableGroup: TableOrdersGroup) => {
      try {
        logger.info('[waiter] MARK_TABLE_PAID_ACTION_ATTEMPT', {
          tableId: tableGroup.tableId,
          tableNumber: tableGroup.tableNumber,
          orderCount: tableGroup.orders.length,
          orderIds: tableGroup.orders.map(o => o.id),
        });
        
        // Optimistic update - mark all orders in group as paid
        const orderIds = new Set(tableGroup.orders.map(o => o.id));
        setOrders(prev => 
          prev.map((o) => orderIds.has(o.id) ? { ...o, paymentStatus: 'paid' } : o)
        );
        
        // Call API for each order in parallel
        const axiosInstance = (await import('@/services/axios')).default;
        await Promise.all(
          tableGroup.orders.map(order => 
            axiosInstance.patch(`/api/v1/admin/orders/${order.id}/mark-paid`)
          )
        );
        
        // Refetch to sync with backend
        refetch();
        
        setToastMessage(`All orders for ${tableGroup.tableNumber} marked as paid`);
        setShowSuccessToast(true);
        
        logger.info('[waiter] MARK_TABLE_PAID_ACTION_SUCCESS', {
          tableId: tableGroup.tableId,
          tableNumber: tableGroup.tableNumber,
          orderCount: tableGroup.orders.length,
        });
      } catch (error) {
        // Revert optimistic update
        const orderIds = new Set(tableGroup.orders.map(o => o.id));
        setOrders(prev => 
          prev.map((o) => {
            if (!orderIds.has(o.id)) return o;
            const originalOrder = tableGroup.orders.find(ord => ord.id === o.id);
            return originalOrder ? { ...o, paymentStatus: originalOrder.paymentStatus } : o;
          })
        );
        
        setToastMessage(`Failed to mark ${tableGroup.tableNumber} as paid`);
        setShowSuccessToast(true);
        
        logger.error('[waiter] MARK_TABLE_PAID_ACTION_ERROR', {
          tableId: tableGroup.tableId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, [refetch]),    
    closeTable: useCallback(async (tableGroupOrData: TableOrdersGroup | CloseTableData) => {
      try {
        // Handle both TableOrdersGroup (from grouped view) and CloseTableData (from modal)
        const tableId = 'orders' in tableGroupOrData ? tableGroupOrData.tableId : tableGroupOrData.tableId;
        const sessionId = 'orders' in tableGroupOrData ? tableGroupOrData.sessionId : tableGroupOrData.sessionId;
        const discount = 'discount' in tableGroupOrData ? tableGroupOrData.discount || 0 : 0;
        const tip = 'tip' in tableGroupOrData ? tableGroupOrData.tip || 0 : 0;
        const notes = 'notes' in tableGroupOrData ? tableGroupOrData.notes : undefined;
        const paymentMethod = 'paymentMethod' in tableGroupOrData ? tableGroupOrData.paymentMethod : 'BILL_TO_TABLE';

        logger.info('[waiter] CLOSE_TABLE_ACTION_ATTEMPT', {
          tableId,
          sessionId,
          discount,
          tip,
        });
        
        // Call correct endpoint to generate bill and close table
        const response = await axiosInstance.post(
          `/api/v1/admin/tables/${tableId}/close-session`,
          {
            paymentMethod,
            discount,
            tip,
            notes,
          }
        );
        
        const bill = response.data?.data || response.data;
        
        logger.info('[waiter] BILL_GENERATED_SUCCESS', {
          billId: bill.id,
          billNumber: bill.billNumber,
          total: bill.total,
          ordersCount: bill.orders?.length || 0,
        });
        
        // Refetch orders to sync with backend
        refetch();
        
        setToastMessage(`Bill ${bill.billNumber} generated - Table closed successfully`);
        setShowSuccessToast(true);
        
      } catch (error) {
        logger.error('[waiter] CLOSE_TABLE_ACTION_ERROR', {
          tableId: 'orders' in tableGroupOrData ? tableGroupOrData.tableId : tableGroupOrData.tableId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        setToastMessage('Failed to close table and generate bill');
        setShowSuccessToast(true);
        
        throw error; // Re-throw to let modal handle it
      }
    }, [refetch]),
    
    toggleOrderExpanded: useCallback((orderId: string) => {
      setExpandedOrders(prev => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(orderId)) {
          newExpanded.delete(orderId);
        } else {
          newExpanded.add(orderId);
        }
        return newExpanded;
      });
    }, []),
    
    resetBillRequestCount,
    
    // Bill request dialog actions
    openBillRequestsDialog: useCallback(() => {
      setShowBillRequestsDialog(true);
    }, []),
    
    closeBillRequestsDialog: useCallback(() => {
      setShowBillRequestsDialog(false);
      resetBillRequestCount();
    }, [resetBillRequestCount]),
    
    handleBillRequestHandled: useCallback((requestId: string) => {
      setBillRequests(prev => prev.filter(r => r.id !== requestId));
    }, []),
    
    refresh: useCallback(() => {
        logger.info('[waiter] REFRESH_ACTION', { trigger: 'manual' });
      refetch();
      setToastMessage('Orders refreshed');
      setShowSuccessToast(true);
    }, [refetch]),
    
    manualOrder: useCallback(() => {
      setToastMessage('Manual order feature - Coming soon');
      setShowSuccessToast(true);
    }, []),
    
    closeToast: useCallback(() => setShowSuccessToast(false), []),
    
    handleLogout,
  };

  // State
  const state: WaiterState = {
    orders,
    isLoading,
    error,
    activeTab,
    expandedOrders,
    isConnected,
    billRequestCount,
    billRequests,
    showBillRequestsDialog,
    currentOrders,
    ordersByTable, // Grouped orders for completed tab
    tabCounts,
    showSuccessToast,
    toastMessage,
  };

  return { state, actions };
}
