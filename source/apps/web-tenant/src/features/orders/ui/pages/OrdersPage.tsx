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
import { useOrdersData, useOrderFilters, useOrderActions } from '../../hooks/useOrdersPageController';
import { useOrdersPageUI } from '../../hooks/useOrdersPageUI';
import { OrdersToolbar, OrdersList, OrdersListSkeleton } from '../components';
import { OrderDetailDrawer } from '../modals';

export function OrdersPage() {
  // Data layer
  const { orders, updateOrder } = useOrdersData();
  
  // Loading/Error states (simulated - would come from API in real app)
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);
  
  // Filters layer
  const {
    filters,
    filteredOrders,
    activeFilters,
    updateFilter,
    removeFilter,
    clearAllFilters,
  } = useOrderFilters(orders);
  
  // Success callback
  const handleSuccess = (message: string) => {
    ui.handleShowSuccess(message);
  };
  
  // Actions layer
  const { acceptOrder, rejectOrder, cancelOrder } = useOrderActions(
    updateOrder,
    handleSuccess
  );

  // UI state and handlers
  const ui = useOrdersPageUI({
    filteredOrders,
    onOrderAction: (action, order) => {
      if (action === 'accept') acceptOrder(order);
      else if (action === 'reject') rejectOrder(order);
      else if (action === 'cancel') cancelOrder(order);
    },
  });

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
              selectedOrderId={ui.selectedOrder?.id ?? null}
              onOrderClick={ui.handleSelectOrder}
            />
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        isOpen={ui.showDrawer}
        order={ui.selectedOrder}
        orders={filteredOrders}
        onClose={ui.handleCloseDrawer}
        onAccept={ui.handleAcceptOrder}
        onReject={ui.handleRejectOrder}
        onCancel={ui.handleCancelOrder}
        onNavigate={ui.onNavigate}
      />

      {/* Success Toast */}
      {ui.showSuccessToast && (
        <Toast
          message={ui.toastMessage}
          type="success"
          onClose={() => ui.setShowSuccessToast(false)}
          duration={3000}
        />
      )}

      {/* Confirm Modal */}
      {ui.showConfirmModal && ui.confirmConfig && (
        <Modal
          isOpen={ui.showConfirmModal}
          onClose={ui.closeConfirmModal}
          title={ui.confirmConfig.title}
          size="md"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                onClick={ui.closeConfirmModal}
                className="px-4 py-2.5 bg-secondary text-text-secondary border border-default hover:bg-elevated active:bg-elevated transition-colors rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={ui.confirmConfig.onConfirm}
                className={`px-4 py-2.5 text-white transition-colors rounded-lg text-sm font-semibold ${
                  ui.confirmConfig.confirmVariant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' 
                    : 'bg-gradient-primary hover:opacity-90 active:opacity-80'
                }`}
              >
                {ui.confirmConfig.confirmText}
              </button>
            </div>
          }
        >
          <p className="text-text-secondary text-sm">
            {ui.confirmConfig.message}
          </p>
        </Modal>
      )}

      {/* Cancel Alert */}
      {ui.showCancelAlert && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <Alert variant="default" className="shadow-lg">
            <AlertDescription>
              {ui.cancelAlertMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
