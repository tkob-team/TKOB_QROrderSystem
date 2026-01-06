'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Toast } from '@/shared/components/Toast';

// Import extracted components
import {
  KdsHeaderBar,
  KdsSummaryPills,
  KdsColumn,
  KdsEmptyColumn,
} from './KdsComponents';
import { KdsTicketCard } from './KdsTicketCard';

// Import types and constants
import type { KdsOrder, KdsStatus, KdsSummaryCounts } from '../types';
import { KDS_COLUMNS, KDS_BUTTON_CONFIG, MOCK_KDS_ORDERS } from '../constants';

interface KdsBoardPageProps {
  showKdsProfile?: boolean;
  enableKitchenServe?: boolean;
}

export function KdsBoardPage({
  showKdsProfile = true,
  enableKitchenServe = false,
}: KdsBoardPageProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ========== STATE ==========
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [orders, setOrders] = useState<KdsOrder[]>(MOCK_KDS_ORDERS);

  // ========== EFFECTS ==========
  // Update current time every second
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // ========== COMPUTED VALUES ==========
  // Sort orders by time DESC (higher time first - older orders first)
  // For PREPARING column: overdue orders first, then by time DESC
  const sortedNewOrders = [...orders]
    .filter((order) => order.status === 'pending')
    .sort((a, b) => b.time - a.time);

  const sortedPreparingOrders = [...orders]
    .filter((order) => order.status === 'preparing')
    .sort((a, b) => {
      // Overdue orders first
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      // Then by time DESC
      return b.time - a.time;
    });

  const sortedReadyOrders = [...orders]
    .filter((order) => order.status === 'ready')
    .sort((a, b) => b.time - a.time);

  // Calculate status summary
  const counts: KdsSummaryCounts = {
    pending: orders.filter((order) => order.status === 'pending').length,
    cooking: orders.filter((order) => order.status === 'preparing').length,
    ready: orders.filter((order) => order.status === 'ready').length,
    overdue: orders.filter((order) => order.isOverdue).length,
  };

  // ========== EVENT HANDLERS ==========
  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    router.push('/auth/login');
  };

  const handleAction = (orderId: string, columnId: string) => {
    setLoadingOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const newStatus: KdsStatus =
      columnId === 'new' ? 'preparing' : columnId === 'preparing' ? 'ready' : 'served';
    const newOrder: KdsOrder = {
      ...order,
      status: newStatus,
      startedAt: newStatus === 'preparing' ? new Date().toISOString() : order.startedAt,
      readyAt: newStatus === 'ready' ? new Date().toISOString() : order.readyAt,
      servedAt: newStatus === 'served' ? new Date().toISOString() : order.servedAt,
      servedBy: newStatus === 'served' ? 'KITCHEN' : order.servedBy,
    };

    // Simulate API call
    setTimeout(() => {
      setLoadingOrderId(null);
      if (Math.random() < 0.9) {
        // Update order status
        setOrders(orders.map((o) => (o.id === orderId ? newOrder : o)));
        setToastMessage(`Order ${orderId} marked as ${newStatus}`);
        setShowSuccessToast(true);
      } else {
        setToastMessage(`Failed to mark order ${orderId} as ${newStatus}`);
        setShowErrorToast(true);
      }
    }, 1000);
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <KdsHeaderBar
        currentTime={currentTime}
        soundEnabled={soundEnabled}
        autoRefresh={autoRefresh}
        showKdsProfile={showKdsProfile}
        isUserMenuOpen={isUserMenuOpen}
        userMenuRef={userMenuRef}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        onToggleUserMenu={() => setIsUserMenuOpen(!isUserMenuOpen)}
        onLogout={handleLogout}
      />

      {/* Summary Pills */}
      <KdsSummaryPills counts={counts} />

      {/* Board */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
          {KDS_COLUMNS.map((column) => {
            const columnOrders =
              column.id === 'new'
                ? sortedNewOrders
                : column.id === 'preparing'
                  ? sortedPreparingOrders
                  : sortedReadyOrders;
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
                      enableKitchenServe={enableKitchenServe}
                      loadingOrderId={loadingOrderId}
                      onAction={handleAction}
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
      {showSuccessToast && (
        <Toast type="success" message={toastMessage} onClose={() => setShowSuccessToast(false)} />
      )}
      {showErrorToast && (
        <Toast type="error" message={toastMessage} onClose={() => setShowErrorToast(false)} />
      )}
    </div>
  );
}
