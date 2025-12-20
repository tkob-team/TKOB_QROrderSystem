'use client'

import { ArrowLeft, Clock, CheckCircle, ChefHat, Package, UtensilsCrossed, Calendar, MapPin, CreditCard, Wallet, Star, Lock, AlertCircle } from 'lucide-react';
import { Order } from '@/types';
import { Language } from '@/types';
import { useState } from 'react';
import { ReviewModal } from '@/components';
import { VerifyEmailRequiredModal } from '@/components';
import { toast } from 'sonner';
import { RequestBillButton } from '@/components';

interface OrderTrackingProps {
  order: Order;
  onBack: () => void;
  onPayOrder: (order: Order) => void;
  isLoggedIn: boolean;
  isEmailVerified?: boolean;
  onVerifyEmail?: () => void;
}

export function OrderTrackingPage({ order, onBack, onPayOrder, isLoggedIn, isEmailVerified = true, onVerifyEmail }: OrderTrackingProps) {
  const [language, setLanguage] = useState<Language>('EN');
  const [reviewModalItem, setReviewModalItem] = useState<typeof order.items[0] | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const text = {
    EN: {
      title: 'Order Tracking',
      orderId: 'Order',
      table: 'Table',
      estimatedTime: 'Estimated time',
      minutes: 'minutes',
      paymentMethod: 'Payment',
      payAtCounter: 'Pay at counter',
      paidByCard: 'Paid',
      orderPending: 'Order pending',
      orderAccepted: 'Order accepted',
      preparing: 'Preparing',
      ready: 'Ready for pickup',
      served: 'Served',
      completed: 'Completed',
      inProgress: 'In progress...',
      orderDetails: 'Order details',
      subtotal: 'Subtotal',
      tax: 'Tax',
      serviceCharge: 'Service charge',
      total: 'Total',
      needHelp: 'Need help?',
      contactStaff: 'Contact staff',
      paymentPending: 'Payment pending',
      paymentPendingDesc: 'This order is unpaid. Please complete payment to finalize.',
      payNowQR: 'Pay now (QR)',
      autoUpdates: 'This page auto-updates. No need to refresh.',
    },
    VI: {
      title: 'Theo dõi đơn hàng',
      orderId: 'Đơn hàng',
      table: 'Bàn',
      estimatedTime: 'Thời gian ước tính',
      minutes: 'phút',
      paymentMethod: 'Thanh toán',
      payAtCounter: 'Thanh toán tại quầy',
      paidByCard: 'Đã thanh toán',
      orderPending: 'Chờ xác nhận',
      orderAccepted: 'Đã xác nhận',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng',
      served: 'Đã phục vụ',
      completed: 'Hoàn thành',
      inProgress: 'Đang xử lý...',
      orderDetails: 'Chi tiết đơn hàng',
      subtotal: 'Tạm tính',
      tax: 'Thuế',
      serviceCharge: 'Phí dịch vụ',
      total: 'Tổng cộng',
      needHelp: 'Cần hỗ trợ?',
      contactStaff: 'Liên hệ nhân viên',
      paymentPending: 'Chờ thanh toán',
      paymentPendingDesc: 'Đơn hàng này chưa thanh toán. Vui lòng hoàn tất thanh toán để xác nhận.',
      payNowQR: 'Thanh toán ngay (QR)',
      autoUpdates: 'Trang này tự động cập nhật. Không cần làm mới.',
    },
  };

  const t = text[language];

  const getStatusProgress = () => {
    const statuses = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed'];
    return statuses.indexOf(order.status);
  };

  const progress = getStatusProgress();

  const getEstimatedTime = () => {
    if (order.status === 'Completed') return 'Order complete!';
    if (order.status === 'Ready') return 'Ready for pickup!';
    if (order.status === 'Preparing' && order.estimatedReadyMinutes) {
      return `~${Math.max(1, order.estimatedReadyMinutes - 5)} minutes remaining`;
    }
    return order.estimatedReadyMinutes ? `~${order.estimatedReadyMinutes} minutes` : 'Processing...';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5" />;
      case 'Accepted':
        return <CheckCircle className="w-5 h-5" />;
      case 'Preparing':
        return <ChefHat className="w-5 h-5" />;
      case 'Ready':
        return <UtensilsCrossed className="w-5 h-5" />;
      case 'Served':
        return <UtensilsCrossed className="w-5 h-5" />;
      case 'Completed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'var(--orange-)';
      case 'Accepted':
        return 'var(--blue-)';
      case 'Preparing':
        return 'var(--orange-)';
      case 'Ready':
        return 'var(--emerald-)';
      case 'Served':
        return 'var(--emerald-)';
      case 'Completed':
        return 'var(--emerald-)';
      default:
        return 'var(--gray-)';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Your order has been submitted and is awaiting confirmation.';
      case 'Accepted':
        return 'The restaurant has accepted your order and will begin preparing it soon.';
      case 'Preparing':
        return 'Your order is currently being prepared by the kitchen.';
      case 'Ready':
        return 'Your order is ready for pickup!';
      case 'Served':
        return 'Your order has been served to your table.';
      case 'Completed':
        return 'Your order has been completed. Enjoy your meal!';
      default:
        return 'Your order is in progress.';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmitReview = (rating: number, comment: string) => {
    // Mock review submission - in real app, this would call an API
    toast.success('Thank you for your review!');
    setReviewModalItem(null);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <div>
            <h2 style={{ color: 'var(--gray-900)' }}>Order #{order.id}</h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
              Table {order.tableNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Content - Single Column, Vertical Timeline */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* Current Status Card */}
          <div className="bg-white rounded-xl p-6 text-center" style={{ borderWidth: '1px', borderColor: 'var(--gray-200)' }}>
            <div className="flex justify-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center`} style={{ backgroundColor: getStatusColor(order.status) + '20' }}>
                {getStatusIcon(order.status)}
              </div>
            </div>
            <h3 className="mb-2" style={{ color: 'var(--gray-900)' }}>
              {order.status}
            </h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
              {getStatusMessage(order.status)}
            </p>
            {order.estimatedReadyMinutes && order.status !== 'Ready' && order.status !== 'Completed' && (
              <div className="flex items-center justify-center gap-2 mt-3" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                <Clock className="w-4 h-4" />
                <span>Ready in approximately {order.estimatedReadyMinutes} minutes</span>
              </div>
            )}
          </div>

          {/* Unpaid Banner */}
          {(order.paymentStatus === 'Unpaid' || order.paymentStatus === 'Failed') && (
            <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--orange-300)', backgroundColor: 'var(--orange-50)' }}>
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--orange-600)' }} />
                <div className="flex-1">
                  <h4 className="mb-1" style={{ color: 'var(--orange-900)', fontSize: '15px' }}>
                    {t.paymentPending}
                  </h4>
                  <p style={{ color: 'var(--orange-700)', fontSize: '13px' }}>
                    {t.paymentPendingDesc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onPayOrder(order)}
                className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  minHeight: '48px',
                }}
              >
                {t.payNowQR} ${order.total.toFixed(2)}
              </button>
            </div>
          )}

          {/* Request Bill Button */}
          <RequestBillButton 
            orderStatus={order.status}
            paymentStatus={order.paymentStatus}
            language={language}
            tableSessionActive={true}
          />

          {/* Timeline - Vertical */}
          <div className="bg-white rounded-xl p-4" style={{ borderWidth: '1px', borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-4" style={{ color: 'var(--gray-900)' }}>
              Order timeline
            </h3>
            <div className="space-y-4">
              {['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed'].map((status, index) => {
                const isActive = index <= progress;
                const timestamp = isActive ? order.createdAt : null;

                return (
                  <div key={status} className="flex items-center gap-3">
                    {/* Step Indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center`}
                        style={{
                          backgroundColor: isActive ? 'var(--emerald-500)' : 'var(--gray-200)',
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
                      <div className="flex items-center justify-between">
                        <div
                          style={{
                            color: isActive ? 'var(--gray-900)' : 'var(--gray-500)',
                            fontSize: '15px',
                          }}
                        >
                          {status}
                        </div>
                        {timestamp && isActive && (
                          <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                            {formatTime(timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--blue-50)' }}>
              <p style={{ color: 'var(--blue-700)', fontSize: '13px' }}>
                💡 {t.autoUpdates}
              </p>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="bg-white rounded-xl p-4" style={{ borderWidth: '1px', borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
              Your order
            </h3>
            <div className="space-y-3" style={{ fontSize: '14px' }}>
              {order.items.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center gap-3">
                    <span style={{ color: 'var(--gray-700)' }}>
                      {item.quantity} × {item.menuItem.name}
                    </span>
                    {isLoggedIn && (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => {
                            if (isEmailVerified) {
                              setReviewModalItem(item);
                            } else {
                              setShowVerifyModal(true);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all hover:bg-[var(--gray-50)] active:scale-95"
                          style={{ borderColor: 'var(--gray-300)' }}
                        >
                          {!isEmailVerified && (
                            <Lock className="w-3 h-3" style={{ color: 'var(--orange-500)' }} />
                          )}
                          <Star className="w-3.5 h-3.5" style={{ color: 'var(--gray-600)' }} />
                          <span style={{ color: 'var(--gray-700)', fontSize: '13px' }}>
                            Write review
                          </span>
                        </button>
                        {!isEmailVerified && (
                          <span style={{ color: 'var(--orange-600)', fontSize: '11px' }}>
                            Email verification required
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Guest helper text */}
            {!isLoggedIn && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--gray-200)' }}>
                <p style={{ color: 'var(--gray-500)', fontSize: '13px', textAlign: 'center' }}>
                  Sign in to review items you ordered
                </p>
              </div>
            )}

            <div className="border-t pt-3 mt-3 flex justify-between" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}>
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalItem && (
        <ReviewModal
          item={reviewModalItem.menuItem}
          onClose={() => setReviewModalItem(null)}
          onSubmit={handleSubmitReview}
        />
      )}

      {/* Verify Email Modal */}
      {showVerifyModal && (
        <VerifyEmailRequiredModal
          onClose={() => setShowVerifyModal(false)}
          onVerifyNow={() => {
            setShowVerifyModal(false);
            if (onVerifyEmail) {
              onVerifyEmail();
            }
          }}
          language={language}
        />
      )}
    </div>
  );
}