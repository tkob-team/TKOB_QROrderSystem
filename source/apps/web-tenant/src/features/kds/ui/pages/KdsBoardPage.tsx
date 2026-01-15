'use client';

import React, { useEffect } from 'react';
import { Toast } from '@/shared/components/Toast';
import { useAuth } from '@/shared/context/AuthContext';
import { useKdsController } from '../../hooks';
import { useKdsWebSocket } from '../../hooks/useKdsWebSocket';
import { useKdsAutoRefresh } from '../../hooks/useKdsAutoRefresh';

// Import UI components
import { KdsHeaderSection as KdsHeaderBar } from '../components/sections/KdsHeaderSection';
import { KdsSummarySection as KdsSummaryPills } from '../components/sections/KdsSummarySection';
import { KdsColumn, KdsEmptyColumn } from '../components/sections/KdsColumnSection';
import { KdsTicketCard } from '../components/cards/KdsTicketCard';

// Import model
import { KDS_COLUMNS } from '../../model/constants';
import { KDS_BUTTON_CONFIG } from '../../utils/buttonConfig';

interface KdsBoardPageProps {
  showKdsProfile?: boolean;
  enableKitchenServe?: boolean;
}

export function KdsBoardPage({
  showKdsProfile = true,
  enableKitchenServe = false,
}: KdsBoardPageProps) {
  // ========== AUTH ==========
  const { user } = useAuth();
  
  // ========== CONTROLLER ==========
  const controller = useKdsController({ showKdsProfile, enableKitchenServe });

  // ========== WEBSOCKET (Real-time updates) ==========
  const { isConnected, newOrderCount } = useKdsWebSocket({
    tenantId: user?.tenantId || '',
    soundEnabled: controller.soundEnabled,
    autoConnect: true,
    onNewOrder: (order) => {
      // Toast notification
      controller.setToastMessage(`Đơn mới #${order.orderNumber} từ bàn ${order.tableName || order.tableId}`);
      controller.setShowSuccessToast(true);
      setTimeout(() => controller.setShowSuccessToast(false), 3000);
    },
  });

  // ========== AUTO-REFRESH FALLBACK (when WebSocket disconnects) ==========
  const { isPolling } = useKdsAutoRefresh({
    enabled: controller.autoRefresh,
    intervalMs: 15000, // 15 seconds fallback
    wsConnected: isConnected,
  });

  // Visual indicator for WebSocket connection
  useEffect(() => {
    if (!isConnected) {
      controller.setToastMessage('Mất kết nối WebSocket - đang kết nối lại...');
      controller.setShowErrorToast(true);
    }
  }, [isConnected]);

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-primary">
      {/* WebSocket Connection Status */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-red-500 z-50 animate-pulse" />
      )}

      {/* Header */}
      <KdsHeaderBar
        currentTime={controller.currentTime}
        soundEnabled={controller.soundEnabled}
        autoRefresh={controller.autoRefresh}
        showKdsProfile={controller.showKdsProfile}
        isUserMenuOpen={controller.isUserMenuOpen}
        userMenuRef={controller.userMenuRef}
        onToggleSound={controller.handleToggleSound}
        onToggleAutoRefresh={controller.handleToggleAutoRefresh}
        onToggleUserMenu={controller.handleToggleUserMenu}
        onLogout={controller.handleLogout}
      />

      {/* Summary Pills */}
      <KdsSummaryPills counts={controller.counts} />

      {/* New Order Badge - WebSocket notification count */}
      {newOrderCount > 0 && (
        <div className="fixed top-20 right-6 z-40">
          <div className="animate-bounce bg-red-500 text-white rounded-full p-4 shadow-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{newOrderCount}</p>
              <p className="text-xs">Đơn mới</p>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
          {KDS_COLUMNS.map((column) => {
            const columnOrders =
              column.id === 'new'
                ? controller.sortedNewOrders
                : column.id === 'preparing'
                  ? controller.sortedPreparingOrders
                  : controller.sortedReadyOrders;
            const buttonConfig = KDS_BUTTON_CONFIG[column.id];

            return (
              <KdsColumn key={column.id} column={column} orderCount={columnOrders.length}>
                {columnOrders.length === 0 ? (
                  <KdsEmptyColumn column={column} />
                ) : (
                  columnOrders.map((order) => (
                    <KdsTicketCard
                      key={order.id}
                      order={order}
                      columnId={column.id}
                      buttonConfig={buttonConfig}
                      enableKitchenServe={controller.enableKitchenServe}
                      loadingOrderId={controller.loadingOrderId}
                      onAction={controller.handleAction}
                    />
                  ))
                )}
              </KdsColumn>
            );
          })}
        </div>
      </main>

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Toasts */}
      {controller.showSuccessToast && (
        <Toast
          type="success"
          message={controller.toastMessage}
          onClose={() => controller.setShowSuccessToast(false)}
        />
      )}
      {controller.showErrorToast && (
        <Toast
          type="error"
          message={controller.toastMessage}
          onClose={() => controller.setShowErrorToast(false)}
        />
      )}
    </div>
  );
}
