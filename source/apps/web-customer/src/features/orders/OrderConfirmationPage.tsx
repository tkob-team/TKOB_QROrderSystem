'use client'

import { CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/api/services/order.service';

interface OrderConfirmationProps {
  orderId: string;
}

export function OrderConfirmationPage({ orderId }: OrderConfirmationProps) {
  const router = useRouter();
  
  // Fetch order from service layer
  const { data: orderResponse, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrder(orderId),
    enabled: !!orderId
  });
  
  const order = orderResponse?.data;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p style={{ color: 'var(--gray-600)' }}>Loading order...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !order || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p style={{ color: 'var(--gray-900)' }} className="text-xl mb-2">Order not found</p>
          <p style={{ color: 'var(--gray-600)' }} className="mb-4">Unable to load order details.</p>
          <button
            onClick={() => router.push('/menu')}
            className="px-6 py-2 rounded-full"
            style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
          >
            Back to menu
          </button>
        </div>
      </div>
    );
  }
  const getStatusProgress = () => {
    const statuses = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed'];
    return statuses.indexOf(order.status);
  };

  const progress = getStatusProgress();

  const text = {
    EN: {
      title: 'Order confirmed!',
      subtitle: 'Your order has been placed successfully',
      orderId: 'Order ID',
      table: 'Table',
      estimatedTime: 'Estimated time',
      minutes: 'minutes',
      paymentMethod: 'Payment method',
      payAtCounter: 'Pay at counter',
      paidByCard: 'Paid by card',
      totalAmount: 'Total amount',
      trackOrder: 'Track order',
      newOrder: 'Back to menu',
      trackOrderLater: 'You can always track your order later from the Orders tab.',
    },
    VI: {
      title: 'Đơn hàng đã xác nhận!',
      subtitle: 'Đơn hàng của bạn đã được đặt thành công',
      orderId: 'Mã đơn hàng',
      table: 'Bàn',
      estimatedTime: 'Thời gian ước tính',
      minutes: 'phút',
      paymentMethod: 'Phương thức thanh toán',
      payAtCounter: 'Thanh toán tại quầy',
      paidByCard: 'Đã thanh toán bằng thẻ',
      totalAmount: 'Tổng cộng',
      trackOrder: 'Theo dõi đơn hàng',
      newOrder: 'Quay lại thực đơn',
      trackOrderLater: 'Bạn có thể theo dõi đơn hàng của mình bất cứ lúc nào từ tab Đơn hàng.',
    },
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Success Header */}
      <div className="bg-white border-b p-6 text-center" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--emerald-100)' }}>
            <CheckCircle className="w-10 h-10" style={{ color: 'var(--emerald-500)' }} />
          </div>
        </div>
        <h1 className="mb-2" style={{ color: 'var(--gray-900)' }}>
          {text.EN.title}
        </h1>
        <p className="mb-2" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
          {text.EN.orderId} #{order.id} · {text.EN.table} {order.tableNumber}
        </p>
        {order.estimatedReadyMinutes && (
          <div className="flex items-center justify-center gap-2" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            <Clock className="w-4 h-4" />
            <span>{text.EN.estimatedTime} {order.estimatedReadyMinutes} {text.EN.minutes}</span>
          </div>
        )}
      </div>

      {/* Content - Single Column */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="p-4 space-y-4">
          {/* Status Timeline */}
          <div className="bg-white rounded-xl p-4" style={{ borderWidth: '1px', borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-4" style={{ color: 'var(--gray-900)' }}>
              Order status
            </h3>
            <div className="space-y-4">
              {['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed'].map((status, index) => {
                const isActive = index <= progress;
                const isCurrent = index === progress;

                return (
                  <div key={status} className="flex items-center gap-3">
                    {/* Step Indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all`}
                        style={{
                          backgroundColor: isActive ? 'var(--emerald-500)' : 'var(--gray-200)',
                          boxShadow: isCurrent ? '0 0 0 4px var(--emerald-100)' : 'none',
                        }}
                      >
                        {isActive && (
                          <CheckCircle className="w-5 h-5" style={{ color: 'white' }} />
                        )}
                      </div>
                      {index < 5 && (
                        <div
                          className="w-0.5 h-8 my-1"
                          style={{
                            backgroundColor: isActive && index < progress ? 'var(--emerald-500)' : 'var(--gray-200)',
                          }}
                        />
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1">
                      <div
                        style={{
                          color: isActive ? 'var(--gray-900)' : 'var(--gray-500)',
                          fontSize: '15px',
                        }}
                      >
                        {status}
                      </div>
                      {isCurrent && (
                        <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                          In progress...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl p-4" style={{ borderWidth: '1px', borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-4" style={{ color: 'var(--gray-900)' }}>
              Order details
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between" style={{ fontSize: '14px' }}>
                  <div className="flex-1">
                    <div style={{ color: 'var(--gray-900)' }}>
                      {item.quantity} × {item.menuItem.name}
                    </div>
                    {(item.selectedSize || item.selectedToppings.length > 0) && (
                      <div style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                        {item.selectedSize && <span>{item.selectedSize}</span>}
                        {item.selectedToppings.length > 0 && (
                          <span>
                            {item.selectedSize && ' · '}
                            {item.selectedToppings
                              .map((id) => {
                                const topping = item.menuItem.toppings?.find((t) => t.id === id);
                                return topping?.name;
                              })
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mt-3 space-y-1" style={{ borderColor: 'var(--gray-200)', fontSize: '14px' }}>
              <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
                <span>Service charge</span>
                <span>${order.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}>
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          {(order.customerName || order.notes) && (
            <div className="bg-white rounded-xl p-4" style={{ borderWidth: '1px', borderColor: 'var(--gray-200)' }}>
              <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
                Customer details
              </h3>
              <div className="space-y-2" style={{ fontSize: '14px' }}>
                {order.customerName && (
                  <div>
                    <span style={{ color: 'var(--gray-600)' }}>Name: </span>
                    <span style={{ color: 'var(--gray-900)' }}>{order.customerName}</span>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <span style={{ color: 'var(--gray-600)' }}>Notes: </span>
                    <span style={{ color: 'var(--gray-900)' }}>{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar - Stacked Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg space-y-2" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="max-w-[480px] mx-auto space-y-2">
          <button
            onClick={() => router.push('/orders')}
            className="w-full py-3 px-6 rounded-full transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: 'var(--orange-500)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            {text.EN.trackOrder}
          </button>
          <button
            onClick={() => router.push('/menu')}
            className="w-full py-3 px-6 rounded-full transition-all hover:bg-[var(--gray-100)] active:scale-95"
            style={{
              backgroundColor: 'white',
              color: 'var(--orange-500)',
              borderWidth: '2px',
              borderColor: 'var(--orange-500)',
              minHeight: '48px',
            }}
          >
            {text.EN.newOrder}
          </button>
          <p className="text-center pt-1" style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
            {text.EN.trackOrderLater}
          </p>
        </div>
      </div>
    </div>
  );
}