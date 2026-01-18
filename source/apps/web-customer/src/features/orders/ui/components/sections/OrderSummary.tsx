/**
 * Order Summary Section
 * 
 * Displays order details, items, and payment status
 * Two modes: Live (tracking with API) and History (detail)
 */

import { Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types/order';
import { log } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { isPaymentRequired } from '../../../model/statusUtils';
import { RequestBillButton } from './RequestBillButton';
import { OrderTrackingTimeline } from '../OrderTrackingTimeline';
import { OrderStatusTimeline } from '../OrderStatusTimeline';
import { useOrderTracking } from '../../../hooks';

interface OrderSummaryProps {
  order: Order;
  isLive: boolean;
}

export function OrderSummary({ order, isLive }: OrderSummaryProps) {
  const router = useRouter();

  if (isLive) {
    return <LiveOrderView order={order} router={router} />;
  }

  return <HistoryOrderView order={order} />;
}

/**
 * Live Order View - Tracking Mode with real API polling
 */
function LiveOrderView({ order, router }: { order: Order; router: ReturnType<typeof useRouter> }) {
  const needsPayment = isPaymentRequired(order.paymentStatus);
  const isCashPayment = order.paymentMethod === 'BILL_TO_TABLE';
  const isQrPayment = order.paymentMethod === 'SEPAY_QR';
  
  // Use real tracking API with polling (2s for real-time feel)
  const { tracking, isLoading: trackingLoading } = useOrderTracking({
    orderId: order.id,
    polling: true,
    pollingInterval: 2000, // 2 seconds for real-time feel
  });

  // Use tracking data if available, fallback to order data
  const currentStatus = tracking?.currentStatus || order.status;
  const statusMessage = tracking?.currentStatusMessage || '';
  const estimatedTime = tracking?.estimatedTimeRemaining;

  return (
    <>
      {/* Current Status Card */}
      <div className="bg-white rounded-xl p-6 text-center border" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex justify-center mb-4">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--emerald-100)' }}
          >
            <Clock className="w-10 h-10" style={{ color: 'var(--emerald-600)' }} />
          </div>
        </div>
        <h3 className="mb-2" style={{ color: 'var(--gray-900)' }}>
          {currentStatus}
        </h3>
        <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
          {statusMessage}
        </p>
        {estimatedTime && estimatedTime > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            <Clock className="w-4 h-4" />
            <span>Estimated time: {estimatedTime} minutes</span>
          </div>
        )}
      </div>

      {/* Payment Banner for QR Payment (if unpaid and chose QR) */}
      {needsPayment && isQrPayment && (
        <div 
          className="bg-white rounded-xl p-4 border" 
          style={{ borderColor: 'var(--orange-300)', backgroundColor: 'var(--orange-50)' }}
        >
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--orange-600)' }} />
            <div className="flex-1">
              <h4 className="mb-1" style={{ color: 'var(--orange-900)', fontSize: '15px' }}>
                Payment pending
              </h4>
              <p style={{ color: 'var(--orange-700)', fontSize: '13px' }}>
                This order is unpaid. Please complete QR payment to finalize.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              log('ui', 'Navigate to payment clicked', { orderId: maskId(order.id) }, { feature: 'orders' });
              router.push(`/payment?orderId=${order.id}&paymentMethod=SEPAY_QR&source=order`);
            }}
            className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            Pay now with QR ${order.total.toFixed(2)}
          </button>
        </div>
      )}

      {/* Cash Payment Banner (if chose BILL_TO_TABLE) */}
      {needsPayment && isCashPayment && (
        <div 
          className="bg-white rounded-xl p-4 border" 
          style={{ borderColor: 'var(--blue-300)', backgroundColor: 'var(--blue-50)' }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--blue-600)' }} />
            <div className="flex-1">
              <h4 className="mb-1" style={{ color: 'var(--blue-900)', fontSize: '15px' }}>
                💵 Cash Payment
              </h4>
              <p style={{ color: 'var(--blue-700)', fontSize: '13px' }}>
                Staff will collect payment when serving your order. Total: <strong>${order.total.toFixed(2)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Request Bill Button */}
      <RequestBillButton 
        orderId={order.id}
        orderStatus={order.status}
        paymentStatus={order.paymentStatus}
        onRequested={() => {
          log('ui', 'Bill requested', { orderId: maskId(order.id) }, { feature: 'orders' });
        }}
      />

      {/* Timeline - Use API data when available, fallback to simple timeline */}
      <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
        <h3 className="mb-4" style={{ color: 'var(--gray-900)' }}>
          Order timeline
        </h3>
        {trackingLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gray-400)' }} />
          </div>
        ) : tracking?.timeline ? (
          <OrderTrackingTimeline
            timeline={tracking.timeline}
            currentStatus={tracking.currentStatus}
            estimatedTimeRemaining={tracking.estimatedTimeRemaining}
            elapsedMinutes={tracking.elapsedMinutes}
          />
        ) : (
          <OrderStatusTimeline currentStatus={order.status} />
        )}
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--blue-50)' }}>
          <p style={{ color: 'var(--blue-700)', fontSize: '13px' }}>
            💡 This page updates automatically in real-time.
          </p>
        </div>
      </div>

      {/* Order Items Summary */}
      <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
        <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
          Your order
        </h3>
        <div className="space-y-3" style={{ fontSize: '14px' }}>
          {order.items.map((item) => {
            // Handle both CartItem (with menuItem) and OrderItemResponseDto (flat structure)
            const itemName = (item as any).menuItem?.name || (item as any).name || 'Unknown Item';
            const itemToppings = (item as any).menuItem?.toppings;
            
            return (
            <div key={item.id}>
              <div className="flex justify-between items-start gap-3">
                <span style={{ color: 'var(--gray-700)' }}>
                  {item.quantity} × {itemName}
                </span>
              </div>
              {(item.selectedSize || item.selectedToppings?.length > 0) && (
                <div style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '4px' }}>
                  {item.selectedSize && `Size: ${item.selectedSize}`}
                  {item.selectedToppings && item.selectedToppings.length > 0 && itemToppings && ` · Toppings: ${item.selectedToppings.map(id => {
                    const topping = itemToppings.find((t: any) => t.id === id);
                    return topping?.name;
                  }).filter(Boolean).join(', ')}`}
                </div>
              )}
              {item.specialInstructions && (
                <div style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '4px' }}>
                  Notes: {item.specialInstructions}
                </div>
              )}
            </div>
          );
          })}
        </div>
        <div className="border-t pt-3 mt-3 flex justify-between" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}>
          <span>Total</span>
          <span style={{ fontWeight: '600' }}>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}

/**
 * History Order View - Detail Mode
 */
function HistoryOrderView({ order }: { order: Order }) {
  return (
    <>
      {/* Order Summary Card */}
      <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--gray-600)' }}>Order ID</span>
            <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>{order.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--gray-600)' }}>Status</span>
            <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>{order.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--gray-600)' }}>Payment</span>
            <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>{order.paymentStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--gray-600)' }}>Items</span>
            <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>{order.items.length}</span>
          </div>
          <div className="pt-3 border-t" style={{ borderColor: 'var(--gray-200)' }}>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>Total</span>
              <span style={{ color: 'var(--orange-500)', fontWeight: '600', fontSize: '18px' }}>
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Breakdown Card */}
      <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
        <h3 style={{ color: 'var(--gray-900)', fontWeight: '500', marginBottom: '12px' }}>
          Pricing Breakdown
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Subtotal</span>
            <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Tax (10%)</span>
            <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Service (5%)</span>
            <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>${order.serviceCharge.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Items Card */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
          <h3 style={{ color: 'var(--gray-900)', fontWeight: '500', marginBottom: '12px' }}>
            Items ({order.items.length})
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => {
              // Handle both CartItem (with menuItem) and OrderItemResponseDto (flat structure)
              const menuItem = (item as any).menuItem;
              const itemName = menuItem?.name || (item as any).name || 'Unknown Item';
              const itemPrice = (item as any).price || menuItem?.basePrice || 0;
              
              // Calculate total price - use itemTotal from API if available
              let calculatedPrice = itemPrice;
              if (item.selectedSize && menuItem?.sizes) {
                const sizeOption = menuItem.sizes.find((s: any) => s.size === item.selectedSize);
                if (sizeOption) calculatedPrice = sizeOption.price;
              }
              if (item.selectedToppings?.length > 0 && menuItem?.toppings) {
                item.selectedToppings.forEach(toppingId => {
                  const topping = menuItem.toppings?.find((t: any) => t.id === toppingId);
                  if (topping) calculatedPrice += topping.price;
                });
              }
              const totalPrice = (item as any).itemTotal || (calculatedPrice * item.quantity);
              
              return (
                <div key={item.id} className="pb-3 border-b" style={{ borderColor: 'var(--gray-100)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>
                      {itemName}
                    </span>
                    <span style={{ color: 'var(--orange-500)', fontWeight: '500' }}>
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                      Qty: {item.quantity}
                      {item.selectedSize && ` · Size: ${item.selectedSize}`}
                    </span>
                  </div>
                  {item.selectedToppings && item.selectedToppings.length > 0 && menuItem?.toppings && (
                    <div style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '4px' }}>
                      Toppings: {item.selectedToppings.map(id => {
                        const topping = menuItem.toppings?.find((t: any) => t.id === id);
                        return topping?.name;
                      }).filter(Boolean).join(', ')}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <div style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '4px' }}>
                      Notes: {item.specialInstructions}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
