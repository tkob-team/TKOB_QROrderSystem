'use client';

import React, { useEffect } from 'react';
import { Toast } from '@/shared/components/Toast';
import { useAuth } from '@/shared/context/AuthContext';
import { useKdsController } from '../../hooks';
import { useKdsWebSocket } from '../../hooks/useKdsWebSocket';
import { useKdsAutoRefresh } from '../../hooks/useKdsAutoRefresh';
import { initializeAudio } from '@/lib/websocket';
import { playNotificationSound } from '@/shared/utils/soundNotifications';

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
        // Remove listener after first successful init
        document.removeEventListener('click', handleFirstClick);
      }
    };
    
    // Listen for first click anywhere on page
    document.addEventListener('click', handleFirstClick, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  // ========== RE-INITIALIZE AUDIO WHEN SOUND IS ENABLED ==========
  useEffect(() => {
    if (controller.soundEnabled) {
      initializeAudio().catch(() => {
        // Initialization error, will retry on next enable
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

  // ========== OVERDUE NOTIFICATION CHECK ==========
  useEffect(() => {
    if (!controller.soundEnabled) return;

    // Helper function to check and play overdue alert
    const checkAndPlayOverdueAlert = () => {
      // Find orders that are overdue AND currently being prepared
      // Note: isOverdue is calculated in mapper based on elapsedMinutes > estimatedTime
      const overdueOrders = controller.orders.filter(order => 
        order.isOverdue && 
        order.status === 'preparing' // Only alert for orders currently being prepared
      );

      if (overdueOrders.length > 0) {
        // Play urgent alert for overdue orders
        playNotificationSound('kds-overdue', 2);
      }
    };

    // Immediate check on mount or when orders change
    checkAndPlayOverdueAlert();

    // Check for overdue orders every 30 seconds
    const checkOverdueInterval = setInterval(checkAndPlayOverdueAlert, 30000);

    return () => clearInterval(checkOverdueInterval);
  }, [controller.orders, controller.soundEnabled]);

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
        showKdsProfile={controller.showKdsProfile}
        isUserMenuOpen={controller.isUserMenuOpen}
        userMenuRef={controller.userMenuRef}
        connectionStatus={status}
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
