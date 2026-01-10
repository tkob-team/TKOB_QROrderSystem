'use client';

import { useState, useCallback } from 'react';
import { Order, ConfirmConfig } from '../model/types';

interface UseOrdersPageUIProps {
  filteredOrders: Order[];
  onOrderAction: (action: 'accept' | 'reject' | 'cancel', order: Order) => void;
}

interface UseOrdersPageUIReturn {
  // Selection state
  selectedOrder: Order | null;
  showDrawer: boolean;
  handleSelectOrder: (order: Order) => void;
  handleCloseDrawer: () => void;

  // Navigation
  onNavigate: (direction: 'prev' | 'next') => void;

  // Toast
  showSuccessToast: boolean;
  toastMessage: string;
  setShowSuccessToast: (show: boolean) => void;
  handleShowSuccess: (message: string) => void;

  // Confirm modal
  showConfirmModal: boolean;
  confirmConfig: ConfirmConfig | null;
  handleAcceptOrder: () => void;
  handleRejectOrder: () => void;
  handleCancelOrder: () => void;
  closeConfirmModal: () => void;

  // Cancel alert
  showCancelAlert: boolean;
  cancelAlertMessage: string;
}

export function useOrdersPageUI({
  filteredOrders,
  onOrderAction,
}: UseOrdersPageUIProps): UseOrdersPageUIReturn {
  // Selection state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // Cancel alert state
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [cancelAlertMessage, setCancelAlertMessage] = useState('');

  // Selection handlers
  const handleSelectOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setShowDrawer(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setShowDrawer(false);
  }, []);

  // Navigation handler
  const onNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (!selectedOrder) return;
      const currentIndex = filteredOrders.findIndex(
        (o) => o.id === selectedOrder.id
      );

      if (direction === 'prev' && currentIndex > 0) {
        setSelectedOrder(filteredOrders[currentIndex - 1]);
      } else if (
        direction === 'next' &&
        currentIndex < filteredOrders.length - 1
      ) {
        setSelectedOrder(filteredOrders[currentIndex + 1]);
      }
    },
    [selectedOrder, filteredOrders]
  );

  // Success callback
  const handleShowSuccess = useCallback((message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);

    // Refresh selected order from updated list
    if (selectedOrder) {
      const updated = filteredOrders.find((o) => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [selectedOrder, filteredOrders]);

  // Confirm modal helpers
  const openConfirmModal = useCallback((config: ConfirmConfig) => {
    setConfirmConfig(config);
    setShowConfirmModal(true);
  }, []);

  const closeConfirmModal = useCallback(() => {
    setShowConfirmModal(false);
    setConfirmConfig(null);
  }, []);

  // Action handlers
  const handleAcceptOrder = useCallback(() => {
    if (!selectedOrder) return;
    onOrderAction('accept', selectedOrder);
  }, [selectedOrder, onOrderAction]);

  const handleRejectOrder = useCallback(() => {
    if (!selectedOrder) return;
    openConfirmModal({
      title: `Reject Order ${selectedOrder.orderNumber}?`,
      message: 'This will cancel the order and it will not be processed.',
      confirmText: 'Reject',
      confirmVariant: 'danger',
      onConfirm: () => {
        onOrderAction('reject', selectedOrder);
        closeConfirmModal();
      },
    });
  }, [selectedOrder, onOrderAction, openConfirmModal, closeConfirmModal]);

  const handleCancelOrder = useCallback(() => {
    if (!selectedOrder) return;
    openConfirmModal({
      title: `Cancel Order ${selectedOrder.orderNumber}?`,
      message:
        'Use this when the customer cancels verbally or items are unavailable.',
      confirmText: 'Cancel Order',
      confirmVariant: 'danger',
      onConfirm: () => {
        onOrderAction('cancel', selectedOrder);
        closeConfirmModal();

        // Show Alert notification
        setCancelAlertMessage(
          `✓ Order ${selectedOrder.orderNumber} has been cancelled successfully!`
        );
        setShowCancelAlert(true);
        setTimeout(() => setShowCancelAlert(false), 4000);
      },
    });
  }, [selectedOrder, onOrderAction, openConfirmModal, closeConfirmModal]);

  return {
    // Selection state
    selectedOrder,
    showDrawer,
    handleSelectOrder,
    handleCloseDrawer,

    // Navigation
    onNavigate,

    // Toast
    showSuccessToast,
    toastMessage,
    setShowSuccessToast,
    handleShowSuccess,

    // Confirm modal
    showConfirmModal,
    confirmConfig,
    handleAcceptOrder,
    handleRejectOrder,
    handleCancelOrder,
    closeConfirmModal,

    // Cancel alert
    showCancelAlert,
    cancelAlertMessage,
  };
}
