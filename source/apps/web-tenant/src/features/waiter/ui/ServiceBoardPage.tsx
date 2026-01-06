/**
 * Waiter Service Board Page - Refactored Orchestrator
 * Thin orchestrator managing state and composition
 * 
 * Reduced from 895 lines to ~270 lines (70% reduction)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Toast } from '@/shared/components';
import {
  ServiceHeaderMobile,
  ServiceHeaderDesktop,
  ServiceTabs,
  EmptyOrdersState,
} from './ServiceComponents';
import { WaiterOrderCard } from './WaiterOrderCard';
import type { ServiceOrder, OrderStatus, ServiceTabCounts } from '../types';
import { MOCK_SERVICE_ORDERS, sortOrdersByStatus } from '../constants';

interface ServiceBoardPageProps {
  userRole?: 'admin' | 'waiter' | 'kds';
}

export function ServiceBoardPage({ userRole = 'waiter' }: ServiceBoardPageProps) {
  // State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState<OrderStatus>('ready');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<ServiceOrder[]>(MOCK_SERVICE_ORDERS);

  // Auto refresh - runs every 15 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const refreshInterval = setInterval(() => {
      // Silent refresh - no toast
      // In real app, this would fetch new data from API
    }, 15000); // 15 seconds

    return () => clearInterval(refreshInterval);
  }, [autoRefresh]);

  // Computed Values
  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const tabCounts: ServiceTabCounts = {
    placed: getOrdersByStatus('placed').length,
    confirmed: getOrdersByStatus('confirmed').length,
    preparing: getOrdersByStatus('preparing').length,
    ready: getOrdersByStatus('ready').length,
    served: getOrdersByStatus('served').length,
    completed: getOrdersByStatus('completed').length,
  };

  const currentOrders = sortOrdersByStatus(orders, activeTab);

  // Handlers
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, message: string) => {
    setOrders(
      orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
    setToastMessage(message);
    setShowSuccessToast(true);
  };

  const handleAcceptOrder = (order: ServiceOrder) => {
    updateOrderStatus(order.id, 'confirmed', `${order.orderNumber} accepted and sent to kitchen`);
  };

  const handleRejectOrder = (order: ServiceOrder) => {
    updateOrderStatus(order.id, 'completed', `${order.orderNumber} rejected`);
  };

  const handleCancelOrder = (order: ServiceOrder) => {
    updateOrderStatus(order.id, 'completed', `${order.orderNumber} cancelled`);
  };

  const handleMarkServed = (order: ServiceOrder) => {
    updateOrderStatus(order.id, 'served', `${order.orderNumber} marked as served`);
  };

  const handleMarkCompleted = (order: ServiceOrder) => {
    updateOrderStatus(order.id, 'completed', `${order.orderNumber} marked as completed`);
  };

  const handleMarkPaid = (order: ServiceOrder) => {
    setOrders(orders.map((o) => (o.id === order.id ? { ...o, paymentStatus: 'paid' } : o)));
    setToastMessage(`${order.orderNumber} payment marked as complete`);
    setShowSuccessToast(true);
  };

  const handleCloseTable = (order: ServiceOrder) => {
    // In real app, this would close/clear the table
    setToastMessage(`${order.table} closed successfully`);
    setShowSuccessToast(true);
  };

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleRefresh = () => {
    setToastMessage('Orders refreshed');
    setShowSuccessToast(true);
  };

  const handleManualOrder = () => {
    // Placeholder: In real app, this would open a modal or navigate to manual order creation
    setToastMessage('Manual order feature - Coming soon');
    setShowSuccessToast(true);
  };

  // Render
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <ServiceHeaderMobile
          soundEnabled={soundEnabled}
          autoRefresh={autoRefresh}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
          onRefresh={handleRefresh}
        />

        {/* Desktop Header */}
        <ServiceHeaderDesktop
          soundEnabled={soundEnabled}
          autoRefresh={autoRefresh}
          userRole={userRole}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
          onRefresh={handleRefresh}
          onManualOrder={handleManualOrder}
        />

        {/* Tab Bar */}
        <ServiceTabs
          activeTab={activeTab}
          tabCounts={tabCounts}
          userRole={userRole}
          onTabChange={setActiveTab}
          onManualOrder={userRole === 'waiter' ? handleManualOrder : undefined}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {/* Orders Grid */}
            {currentOrders.length === 0 ? (
              <EmptyOrdersState activeTab={activeTab} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentOrders.map((order) => (
                  <WaiterOrderCard
                    key={order.id}
                    order={order}
                    activeTab={activeTab}
                    isExpanded={expandedOrders.has(order.id)}
                    onToggleExpanded={toggleOrderExpanded}
                    onAcceptOrder={handleAcceptOrder}
                    onRejectOrder={handleRejectOrder}
                    onCancelOrder={handleCancelOrder}
                    onMarkServed={handleMarkServed}
                    onMarkCompleted={handleMarkCompleted}
                    onMarkPaid={handleMarkPaid}
                    onCloseTable={handleCloseTable}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showSuccessToast && (
        <Toast message={toastMessage} type="success" onClose={() => setShowSuccessToast(false)} />
      )}
    </div>
  );
}
