/**
 * Waiter Service Board Page - Refactored with Controller
 * Thin UI layer using useWaiterController hook
 */

'use client';

import React, { useEffect } from 'react';
import { Toast } from '@/shared/components';
import { useWaiterController } from '../../hooks';
import { initializeAudio } from '@/lib/websocket';
import {
  ServiceHeaderMobile,
  ServiceHeaderDesktop,
} from '../components/sections/ServiceHeaderSection';
import { ServiceTabsSection } from '../components/sections/ServiceTabsSection';
import { ServiceEmptyStateSection } from '../components/sections/ServiceEmptyStateSection';
import { WaiterOrderCard } from '../components/cards/WaiterOrderCard';
import { TableOrdersGroup } from '../components/groups/TableOrdersGroup';
import { BillRequestsDialog } from '../components/modals/BillRequestsDialog';

interface ServiceBoardPageProps {
  userRole?: 'admin' | 'waiter' | 'kds';
}

export function ServiceBoardPage({ userRole = 'waiter' }: ServiceBoardPageProps) {
  // All state and logic managed by controller
  const { state, actions } = useWaiterController();

  // ========== INITIALIZE AUDIO ON FIRST USER CLICK (required by browser autoplay policy) ==========
  useEffect(() => {
    let initialized = false;
    
    const handleFirstClick = async () => {
      if (!initialized) {
        initialized = true;
        try {
          const success = await initializeAudio();
          if (!success) {
            // Audio init failed, will retry on sound enable
          }
        } catch (err) {
          // Audio init error, will retry on sound enable
        }
        document.removeEventListener('click', handleFirstClick);
      }
    };
    
    document.addEventListener('click', handleFirstClick, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  // Render
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <ServiceHeaderMobile
          billRequestCount={state.billRequestCount}
          onBillRequestClick={actions.openBillRequestsDialog}
          onLogout={actions.handleLogout}
        />

        {/* Desktop Header */}
        <ServiceHeaderDesktop
          userRole={userRole}
          billRequestCount={state.billRequestCount}
          onManualOrder={actions.manualOrder}
          onBillRequestClick={actions.openBillRequestsDialog}
          onLogout={actions.handleLogout}
        />

        {/* Tab Bar */}
        <ServiceTabsSection
          activeTab={state.activeTab}
          tabCounts={state.tabCounts}
          userRole={userRole}
          onTabChange={actions.setActiveTab}
          onManualOrder={userRole === 'waiter' ? actions.manualOrder : undefined}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {/* Loading State */}
            {state.isLoading && (
              <div className="text-center py-8 text-gray-500">
                Loading orders...
              </div>
            )}

            {/* Error State */}
            {state.error && (
              <div className="text-center py-8 text-red-500">
                Error: {state.error.message}
              </div>
            )}

            {/* Orders Grid */}
            {!state.isLoading && !state.error && state.currentOrders.length === 0 && state.ordersByTable.length === 0 && (
              <ServiceEmptyStateSection activeTab={state.activeTab} />
            )}

            {/* Completed Tab - Show Grouped Orders by Table */}
            {!state.isLoading && !state.error && state.activeTab === 'completed' && state.ordersByTable.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {state.ordersByTable.map((tableGroup) => (
                  <TableOrdersGroup
                    key={`${tableGroup.tableId}-${tableGroup.sessionId}`}
                    tableGroup={tableGroup}
                    onCloseTable={actions.closeTable}
                    onMarkAsPaid={actions.markTableAsPaid}
                  />
                ))}
              </div>
            )}

            {/* Other Tabs - Show Individual Orders */}
            {!state.isLoading && !state.error && state.activeTab !== 'completed' && state.currentOrders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {state.currentOrders.map((order) => (
                  <WaiterOrderCard
                    key={order.id}
                    order={order}
                    activeTab={state.activeTab}
                    isExpanded={state.expandedOrders.has(order.id)}
                    onToggleExpanded={actions.toggleOrderExpanded}
                    onAcceptOrder={actions.acceptOrder}
                    onRejectOrder={actions.rejectOrder}
                    onCancelOrder={actions.cancelOrder}
                    onMarkServed={actions.markServed}
                    onMarkCompleted={actions.markCompleted}
                    onMarkPaid={actions.markPaid}
                    onCloseTable={actions.closeTable}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bill Requests Dialog */}
      <BillRequestsDialog
        isOpen={state.showBillRequestsDialog}
        onClose={actions.closeBillRequestsDialog}
        billRequests={state.billRequests}
        onRequestHandled={actions.handleBillRequestHandled}
      />

      {state.showSuccessToast && (
        <Toast 
          message={state.toastMessage} 
          type="success" 
          onClose={actions.closeToast} 
        />
      )}
    </div>
  );
}
