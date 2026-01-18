'use client';

import React, { useEffect } from 'react';
import { Toast } from '@/shared/components/Toast';
import { useAuth } from '@/shared/context/AuthContext';
import { useKdsController } from '../../hooks';
import { useKdsWebSocket } from '../../hooks/useKdsWebSocket';
import { useKdsAutoRefresh } from '../../hooks/useKdsAutoRefresh';
import { initializeAudio } from '@/lib/websocket';

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

  // ========== INITIALIZE AUDIO ON MOUNT (user gesture satisfied by page navigation) ==========
  useEffect(() => {
    // Initialize audio context on mount (page navigation counts as user gesture)
    initializeAudio()
      .then((success) => {
        if (success) {
          console.log('[kds] Audio initialized successfully');
        } else {
          console.warn('[kds] Audio initialization failed, sounds may not play');
        }
      })
      .catch((err) => {
        console.error('[kds] Audio initialization error:', err);
      });
  }, []);

  // ========== RE-INITIALIZE AUDIO WHEN SOUND IS ENABLED ==========
  useEffect(() => {
    if (controller.soundEnabled) {
      // User just enabled sound - ensure audio context is ready
      initializeAudio()
        .then((success) => {
          if (success) {
            console.log('[kds] Audio re-initialized on sound enable');
          }
        })
        .catch((err) => {
          console.error('[kds] Audio re-initialization error:', err);
        });
    }
  }, [controller.soundEnabled]);

  // ========== WEBSOCKET (Real-time updates) ==========
  const { status, isConnected, newOrderCount, resetNewOrderCount } = useKdsWebSocket({
    tenantId: user?.tenantId || '',
    soundEnabled: controller.soundEnabled,
    autoConnect: true,
    onNewOrder: (order) => {
      // Toast notification
      controller.setToastMessage(`New order #${order.orderNumber} from table ${order.tableName || order.tableId}`);
      controller.setShowSuccessToast(true);
      setTimeout(() => controller.setShowSuccessToast(false), 3000);
    },
  });

  // ========== AUTO-HIDE NEW ORDER BADGE (after 5 seconds) ==========
  useEffect(() => {
    if (newOrderCount > 0) {
      const timer = setTimeout(() => {
        resetNewOrderCount();
      }, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [newOrderCount, resetNewOrderCount]);

  // ========== AUTO-REFRESH FALLBACK (when WebSocket disconnects) ==========
  const { isPolling } = useKdsAutoRefresh({
    enabled: controller.autoRefresh,
    intervalMs: 15000, // 15 seconds fallback
    wsConnected: isConnected,
  });

  // Visual indicator for WebSocket connection status
  useEffect(() => {
    // Only show error toast if truly disconnected (not during initial connecting)
    if (status === 'disconnected' && !isConnected) {
      controller.setToastMessage('Disconnected from server. Attempting to reconnect...');
      controller.setShowErrorToast(true);
      
      // Auto-hide error toast after 5 seconds
      const timer = setTimeout(() => {
        controller.setShowErrorToast(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Hide error toast when reconnected
    if (isConnected) {
      controller.setShowErrorToast(false);
    }
  }, [status, isConnected]);

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-primary">
      {/* WebSocket Connection Status Indicator */}
      {status === 'connecting' && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-yellow-500 z-50 animate-pulse" />
      )}
      {status === 'disconnected' && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-red-500 z-50 animate-pulse" />
      )}
      {status === 'error' && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-orange-500 z-50 animate-pulse" />
      )}

      {/* Header */}
      <KdsHeaderBar
        currentTime={controller.currentTime}
        soundEnabled={controller.soundEnabled}
        autoRefresh={controller.autoRefresh}
        showKdsProfile={controller.showKdsProfile}
        isUserMenuOpen={controller.isUserMenuOpen}
        userMenuRef={controller.userMenuRef}
        connectionStatus={status}
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
              <p className="text-xs">New Orders</p>
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
