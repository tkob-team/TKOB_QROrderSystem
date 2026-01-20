/**
 * Order Detail Page - Customer order tracking view
 * 
 * Real-time order tracking using lazy WebSocket connection:
 * - Socket connects only when user enters this page (on-demand)
 * - Disconnects automatically when leaving the page
 * - Reduces unnecessary connections and saves server resources
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Clock, AlertCircle, CheckCircle2, XCircle, FileText, Wifi, WifiOff } from 'lucide-react';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import { useRequestBill } from '../../hooks/useRequestBill';
import { useOrderRealtimeUpdates } from '../../hooks/useOrderRealtimeUpdates';
import { useSession } from '@/features/tables/hooks/useSession';
import { log } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { OrderTrackingTimeline } from '../components/OrderTrackingTimeline';

interface OrderDetailPageProps {
  orderId: string;
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const router = useRouter();
  const [billRequestSuccess, setBillRequestSuccess] = useState(false);
  
  // Get session for WebSocket connection
  const { session } = useSession();

  // Fetch tracking data (will be auto-updated by WebSocket invalidation)
  const { tracking, isLoading } = useOrderTracking({
    orderId: orderId || '',
    enabled: !!orderId,
    polling: false, // No polling - WebSocket handles real-time updates
  });
  
  // LAZY WEBSOCKET CONNECTION - Only connects when on this page
  const { isRealtimeConnected, connectionStatus } = useOrderRealtimeUpdates({
    tenantId: session?.tenantId || '',
    tableId: session?.tableId || '',
    orderId: orderId,
    enabled: !!orderId && !!session?.tenantId && !!session?.tableId,
    onStatusChange: (status, updatedOrderId) => {
      log('ui', 'Order status changed (realtime)', {
        orderId: maskId(updatedOrderId),
        newStatus: status,
      }, { feature: 'order-detail' });
    },
  });

  // Request bill mutation
  const { mutate: requestBill, isPending: isRequestingBill, isError, error } = useRequestBill();

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">Invalid order ID</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">Unable to load order details</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = ['COMPLETED', 'SERVED', 'CANCELLED'].includes(tracking.currentStatus);
  const isCancelled = tracking.currentStatus === 'CANCELLED';
  const canRequestBill = tracking.currentStatus === 'SERVED' && tracking.paymentStatus !== 'COMPLETED';

  const handleRequestBill = () => {
    if (!orderId) return;
    requestBill(undefined, {
      onSuccess: () => {
        setBillRequestSuccess(true);
        setTimeout(() => setBillRequestSuccess(false), 5000); // Hide after 5s
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Order Tracking</h1>
              <p className="text-sm text-gray-600">
                Order #{orderId.slice(-8).toUpperCase()}
              </p>
            </div>
            
            {/* Real-time Connection Indicator */}
            {!isCompleted && (
              <div className="flex items-center gap-2">
                {isRealtimeConnected ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                    <Wifi className="w-4 h-4" />
                    <span className="hidden sm:inline">Live</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                ) : connectionStatus === 'connecting' ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Connecting</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                    <WifiOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Current Status Card */}
        <div className="bg-white rounded-xl p-6 text-center border">
          <div className="flex justify-center mb-4">
            <div 
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isCancelled 
                  ? 'bg-red-100' 
                  : isCompleted 
                  ? 'bg-emerald-100' 
                  : 'bg-blue-100'
              }`}
            >
              {isCancelled ? (
                <XCircle className="w-10 h-10 text-red-600" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              ) : (
                <Clock className="w-10 h-10 text-blue-600" />
              )}
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            {tracking.currentStatus.replace(/_/g, ' ')}
          </h3>
          <p className="text-gray-600">
            {tracking.currentStatusMessage}
          </p>
          {tracking.estimatedTimeRemaining && tracking.estimatedTimeRemaining > 0 && !isCompleted && (
            <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Estimated time: {tracking.estimatedTimeRemaining} minutes</span>
            </div>
          )}
          
          {/* Request Bill Button - Only show when order is served and not paid */}
          {canRequestBill && (
            <div className="mt-6 space-y-3">
              <button
                onClick={handleRequestBill}
                disabled={isRequestingBill || billRequestSuccess}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isRequestingBill ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Requesting...</span>
                  </>
                ) : billRequestSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Bill Requested</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>Request Bill</span>
                  </>
                )}
              </button>
              
              {billRequestSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm text-center">
                  ✓ A waiter will bring your bill to the table shortly
                </div>
              )}
              
              {isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {error?.message || 'Failed to request bill. Please try again.'}
                </div>
              )}
              
              {!billRequestSuccess && !isError && (
                <p className="text-sm text-gray-500 text-center">
                  A waiter will bring your bill to the table
                </p>
              )}
            </div>
          )}
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-xl p-6 border">
          <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
          <OrderTrackingTimeline 
            timeline={tracking.timeline}
            currentStatus={tracking.currentStatus}
            estimatedTimeRemaining={tracking.estimatedTimeRemaining}
            elapsedMinutes={tracking.elapsedMinutes}
          />
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl p-6 border">
          <h2 className="text-lg font-semibold mb-4">Order Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order Number</span>
              <span className="font-medium">{tracking.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Table Number</span>
              <span className="font-medium">{tracking.tableNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created At</span>
              <span className="font-medium">
                {new Date(tracking.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
