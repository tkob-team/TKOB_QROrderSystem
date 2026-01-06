/**
 * Orders Page - Thin Orchestrator
 * 
 * Refactored to use feature-based + colocation architecture:
 * - Hooks layer: useOrdersData, useOrderFilters, useOrderActions
 * - Components layer: OrdersToolbar, OrdersList, OrderDetailDrawer
 * - Types/Constants extracted to separate files
 * 
 * This page now acts as a thin orchestrator that composes sub-components.
 */

'use client';

import React, { useState } from 'react';
import { Toast, Modal } from '@/shared/components';
import { PageHeader, ErrorState } from '@/shared/patterns';
import { Alert, AlertDescription } from '@packages/ui';

// Feature imports (colocation)
import { Order, ConfirmConfig } from '../types';
import { useOrdersData, useOrderFilters, useOrderActions } from '../hooks';
import { OrdersToolbar, OrdersList, OrdersListSkeleton } from './OrderComponents';
import { OrderDetailDrawer } from './OrderDetailDrawer';

export function OrdersPage() {
  // Data layer
  const { orders, updateOrder } = useOrdersData();
  
  // Loading/Error states (simulated - would come from API in real app)
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);
  
  // Selected order state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  
  // Filters layer
  const {
    filters,
    filteredOrders,
    activeFilters,
    updateFilter,
    removeFilter,
    clearAllFilters,
  } = useOrderFilters(orders);
  
  // Toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Alert for Cancel Order
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [cancelAlertMessage, setCancelAlertMessage] = useState('');

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // Success callback
  const handleSuccess = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    
    // Refresh selected order from updated list
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  };
  
  // Actions layer
  const { acceptOrder, rejectOrder, cancelOrder } = useOrderActions(
    updateOrder,
    handleSuccess
  );

  // Drawer handlers
  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
  };

  const handleNavigateDrawer = (direction: 'prev' | 'next') => {
    if (!selectedOrder) return;
    const currentIndex = filteredOrders.findIndex(o => o.id === selectedOrder.id);
    
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedOrder(filteredOrders[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < filteredOrders.length - 1) {
      setSelectedOrder(filteredOrders[currentIndex + 1]);
    }
  };

  // Confirm modal helpers
  const openConfirmModal = (config: ConfirmConfig) => {
    setConfirmConfig(config);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmConfig(null);
  };

  // Action handlers with confirmation
  const handleAcceptOrder = () => {
    if (!selectedOrder) return;
    acceptOrder(selectedOrder);
  };

  const handleRejectOrderConfirm = () => {
    if (!selectedOrder) return;
    openConfirmModal({
      title: `Reject Order ${selectedOrder.orderNumber}?`,
      message: 'This will cancel the order and it will not be processed.',
      confirmText: 'Reject',
      confirmVariant: 'danger',
      onConfirm: () => {
        rejectOrder(selectedOrder);
        closeConfirmModal();
      },
    });
  };

  const handleCancelOrderConfirm = () => {
    if (!selectedOrder) return;
    openConfirmModal({
      title: `Cancel Order ${selectedOrder.orderNumber}?`,
      message: 'Use this when the customer cancels verbally or items are unavailable.',
      confirmText: 'Cancel Order',
      confirmVariant: 'danger',
      onConfirm: () => {
        cancelOrder(selectedOrder);
        closeConfirmModal();
        
        // Show Alert notification
        setCancelAlertMessage(`✓ Order ${selectedOrder.orderNumber} has been cancelled successfully!`);
        setShowCancelAlert(true);
        setTimeout(() => setShowCancelAlert(false), 4000);
      },
    });
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="bg-secondary border-b border-default px-6 py-4">
          <PageHeader
            title="Orders"
            subtitle="View and manage all restaurant orders"
          />

          {/* Toolbar */}
          <div className="mt-4">
            <OrdersToolbar
              filters={filters}
              activeFilters={activeFilters}
              onFilterChange={updateFilter}
              onRemoveFilter={removeFilter}
              onClearAll={clearAllFilters}
            />
          </div>
        </div>

        {/* Order List */}
        <div className="flex-1 overflow-auto px-6 py-5">
          {isLoading ? (
            <OrdersListSkeleton rows={6} />
          ) : error ? (
            <div className="bg-secondary border border-default rounded-2xl">
              <ErrorState
                title="Failed to load orders"
                message={error.message || 'Something went wrong. Please try again.'}
                onRetry={() => window.location.reload()}
              />
            </div>
          ) : (
            <OrdersList
              orders={filteredOrders}
              selectedOrderId={selectedOrder?.id ?? null}
              onOrderClick={handleOpenDrawer}
            />
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        isOpen={showDrawer}
        order={selectedOrder}
        orders={filteredOrders}
        onClose={handleCloseDrawer}
        onAccept={handleAcceptOrder}
        onReject={handleRejectOrderConfirm}
        onCancel={handleCancelOrderConfirm}
        onNavigate={handleNavigateDrawer}
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowSuccessToast(false)}
          duration={3000}
        />
      )}

      {/* Confirm Modal */}
      {showConfirmModal && confirmConfig && (
        <Modal
          isOpen={showConfirmModal}
          onClose={closeConfirmModal}
          title={confirmConfig.title}
          size="md"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2.5 bg-secondary text-text-secondary border border-default hover:bg-elevated active:bg-elevated transition-colors rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className={`px-4 py-2.5 text-white transition-colors rounded-lg text-sm font-semibold ${
                  confirmConfig.confirmVariant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' 
                    : 'bg-gradient-primary hover:opacity-90 active:opacity-80'
                }`}
              >
                {confirmConfig.confirmText}
              </button>
            </div>
          }
        >
          <p className="text-text-secondary text-sm">
            {confirmConfig.message}
          </p>
        </Modal>
      )}

      {/* Cancel Alert */}
      {showCancelAlert && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <Alert variant="success" className="shadow-lg">
            <AlertDescription>
              {cancelAlertMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
