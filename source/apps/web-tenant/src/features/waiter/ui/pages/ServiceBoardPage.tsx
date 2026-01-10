/**
 * Waiter Service Board Page - Refactored with Controller
 * Thin UI layer using useWaiterController hook
 */

'use client';

import React from 'react';
import { Toast } from '@/shared/components';
import { useWaiterController } from '../../hooks';
import {
  ServiceHeaderMobile,
  ServiceHeaderDesktop,
} from '../components/sections/ServiceHeaderSection';
import { ServiceTabsSection } from '../components/sections/ServiceTabsSection';
import { ServiceEmptyStateSection } from '../components/sections/ServiceEmptyStateSection';
import { WaiterOrderCard } from '../components/cards/WaiterOrderCard';

interface ServiceBoardPageProps {
  userRole?: 'admin' | 'waiter' | 'kds';
}

export function ServiceBoardPage({ userRole = 'waiter' }: ServiceBoardPageProps) {
  // All state and logic managed by controller
  const { state, actions } = useWaiterController();

  // Render
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <ServiceHeaderMobile
          soundEnabled={state.soundEnabled}
          autoRefresh={state.autoRefresh}
          onToggleSound={actions.toggleSound}
          onToggleAutoRefresh={actions.toggleAutoRefresh}
          onRefresh={actions.refresh}
        />

        {/* Desktop Header */}
        <ServiceHeaderDesktop
          soundEnabled={state.soundEnabled}
          autoRefresh={state.autoRefresh}
          userRole={userRole}
          onToggleSound={actions.toggleSound}
          onToggleAutoRefresh={actions.toggleAutoRefresh}
          onRefresh={actions.refresh}
          onManualOrder={actions.manualOrder}
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
            {!state.isLoading && !state.error && state.currentOrders.length === 0 && (
              <ServiceEmptyStateSection activeTab={state.activeTab} />
            )}

            {!state.isLoading && !state.error && state.currentOrders.length > 0 && (
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
