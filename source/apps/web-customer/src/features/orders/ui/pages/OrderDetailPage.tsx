/**
 * Order Detail Page - Customer order tracking view
 * 
 * Real-time order tracking using WebSocket-triggered React Query invalidation
 * WebSocket connection is managed globally by app layout
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import { log } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { OrderTrackingTimeline } from '../components/OrderTrackingTimeline';

export function OrderDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  // Fetch tracking data (WebSocket automatically invalidates this query)
  const { tracking, isLoading } = useOrderTracking({
    orderId: orderId || '',
    enabled: !!orderId,
    polling: false, // WebSocket handles real-time updates
  });

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
            {!isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Live tracking</span>
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
