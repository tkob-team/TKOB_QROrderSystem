/**
 * Order Summary Section
 * 
 * Displays order details, items, and payment status
 * Two modes: Live (tracking) and History (detail)
 */

import { Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types/order';
import { log } from '@/shared/logging/logger';
import { maskId } from '@/shared/logging/helpers';
import { getStatusMessage, isPaymentRequired, shouldShowEstimatedTime } from '../../../model/statusUtils';
import { RequestBillButton } from './RequestBillButton';
import { OrderStatusTimeline } from '../OrderStatusTimeline';

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
 * Live Order View - Tracking Mode
 */
function LiveOrderView({ order, router }: { order: Order; router: any }) {
  const needsPayment = isPaymentRequired(order.paymentStatus);
  const showEstimatedTime = shouldShowEstimatedTime(order.status);

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
          {order.status}
        </h3>
        <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
          {getStatusMessage(order.status)}
        </p>
        {showEstimatedTime && (
          <div className="flex items-center justify-center gap-2 mt-3" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            <Clock className="w-4 h-4" />
            <span>Estimated time: 18 minutes</span>
          </div>
        )}
      </div>

      {/* Unpaid Banner */}
      {needsPayment && (
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
                This order is unpaid. Please complete payment to finalize.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              log('ui', 'Navigate to payment clicked', { orderId: maskId(order.id) }, { feature: 'orders' });
              router.push(`/payment?orderId=${order.id}&source=order`);
            }}
            className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            Pay now ${order.total.toFixed(2)}
          </button>
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

      {/* Timeline */}
      <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
        <h3 className="mb-4" style={{ color: 'var(--gray-900)' }}>
          Order timeline
        </h3>
        <OrderStatusTimeline currentStatus={order.status} />
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--blue-50)' }}>
          <p style={{ color: 'var(--blue-700)', fontSize: '13px' }}>
            💡 This page updates automatically. No need to refresh.
          </p>
        </div>
      </div>

      {/* Order Items Summary */}
      <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
        <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
          Your order
        </h3>
        <div className="space-y-3" style={{ fontSize: '14px' }}>
          {order.items.map((item) => (
            <div key={item.id}>
              <div className="flex justify-between items-start gap-3">
                <span style={{ color: 'var(--gray-700)' }}>
                  {item.quantity} × {item.menuItem.name}
                </span>
              </div>
              {(item.selectedSize || item.selectedToppings?.length > 0) && (
                <div style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '4px' }}>
                  {item.selectedSize && `Size: ${item.selectedSize}`}
                  {item.selectedToppings && item.selectedToppings.length > 0 && ` · Toppings: ${item.selectedToppings.map(id => {
                    const topping = item.menuItem.toppings?.find(t => t.id === id);
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
          ))}
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
              // Calculate item price
              let itemPrice = item.menuItem.basePrice;
              if (item.selectedSize && item.menuItem.sizes) {
                const sizeOption = item.menuItem.sizes.find(s => s.size === item.selectedSize);
                if (sizeOption) itemPrice = sizeOption.price;
              }
              if (item.selectedToppings?.length > 0 && item.menuItem.toppings) {
                item.selectedToppings.forEach(toppingId => {
                  const topping = item.menuItem.toppings?.find(t => t.id === toppingId);
                  if (topping) itemPrice += topping.price;
                });
              }
              const totalPrice = itemPrice * item.quantity;
              
              return (
                <div key={item.id} className="pb-3 border-b" style={{ borderColor: 'var(--gray-100)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>
                      {item.menuItem.name}
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
                  {item.selectedToppings && item.selectedToppings.length > 0 && (
                    <div style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '4px' }}>
                      Toppings: {item.selectedToppings.map(id => {
                        const topping = item.menuItem.toppings?.find(t => t.id === id);
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
