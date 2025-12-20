'use client'

import { ClipboardList, CheckCircle, Clock, ChefHat, LogIn, ChevronRight } from 'lucide-react';
import { Order } from '@/types';
import { StatusBadge } from '@/components';
import { LanguageSwitcher } from '@/components';
import { Language } from '@/types';
import { useState } from 'react';

interface OrdersProps {
  currentOrder: Order | null;
  orderHistory: Order[];
  isLoggedIn: boolean;
  onOrderClick: (order: Order) => void;
  onHistoryOrderClick: (order: Order) => void;
  onPayOrder: (order: Order) => void;
  onLogin: () => void;
}

export function OrdersPage({ currentOrder, orderHistory, isLoggedIn, onOrderClick, onHistoryOrderClick, onPayOrder, onLogin }: OrdersProps) {
  const [language, setLanguage] = useState<Language>('EN');

  const text = {
    EN: {
      title: 'Orders',
      currentSession: 'Current Session',
      noActiveOrder: 'No active order',
      noActiveOrderDesc: 'Place an order to see it here',
      paymentStatus: 'Payment',
      paid: 'Paid',
      unpaid: 'Unpaid',
      sessionNote: 'Payment received. Your session will close after all items are served.',
      sessionCompleted: 'Session completed',
      orderHistory: 'Order History',
      signInPrompt: 'Sign in to view your past orders',
      signInButton: 'Sign in',
      noPastOrders: 'No past orders yet',
      viewDetails: 'View details',
      items: 'items',
      viewTracking: 'View Tracking',
      payAmount: 'Pay',
      status: 'Status',
    },
    VI: {
      title: 'Đơn hàng',
      currentSession: 'Phiên hiện tại',
      noActiveOrder: 'Không có đơn hàng',
      noActiveOrderDesc: 'Đặt món để xem tại đây',
      paymentStatus: 'Thanh toán',
      paid: 'Đã thanh toán',
      unpaid: 'Chưa thanh toán',
      sessionNote: 'Đã nhận thanh toán. Phiên của bạn sẽ đóng sau khi tất cả món được phục vụ.',
      sessionCompleted: 'Phiên đã hoàn thành',
      orderHistory: 'Lịch sử đơn hàng',
      signInPrompt: 'Đăng nhập để xem đơn hàng cũ',
      signInButton: 'Đăng nhập',
      noPastOrders: 'Chưa có đơn hàng cũ',
      viewDetails: 'Xem chi tiết',
      items: 'món',
      viewTracking: 'Xem theo dõi',
      payAmount: 'Thanh toán',
      status: 'Trạng thái',
    },
  };

  const t = text[language];

  const getPaymentStatusBadge = (order: Order) => {
    const isPaid = order.paymentStatus === 'Paid';
    const isFailed = order.paymentStatus === 'Failed';
    
    return (
      <span
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
        style={{
          backgroundColor: isPaid ? 'var(--emerald-100)' : isFailed ? 'var(--red-100)' : 'var(--orange-100)',
          color: isPaid ? 'var(--emerald-700)' : isFailed ? 'var(--red-700)' : 'var(--orange-700)',
          fontSize: '13px',
        }}
      >
        {isPaid ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        {isPaid ? t.paid : t.unpaid}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
        return <CheckCircle className="w-5 h-5" />;
      case 'Preparing':
        return <ChefHat className="w-5 h-5" />;
      case 'Ready':
        return <CheckCircle className="w-5 h-5" />;
      case 'Completed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showSessionNote = currentOrder && 
    currentOrder.paymentMethod === 'card' && 
    currentOrder.status !== 'Completed';

  const showSessionCompleted = currentOrder && 
    currentOrder.paymentMethod === 'card' && 
    currentOrder.status === 'Completed';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center justify-between">
          <h2 style={{ color: 'var(--gray-900)' }}>{t.title}</h2>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Current Session Section */}
        <div className="mb-6">
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
            {t.currentSession}
          </h3>

          {currentOrder ? (
            <>
              {/* Current Order Card */}
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: 'var(--gray-200)' }}>
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: 'var(--gray-900)' }}>
                        Order #{currentOrder.id}
                      </span>
                    </div>
                    <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                      Table {currentOrder.tableNumber} • {formatDate(currentOrder.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={currentOrder.status} />
                </div>

                {/* Order Details */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                    {getStatusIcon(currentOrder.status)}
                    <span>{currentOrder.items.length} {t.items}</span>
                  </div>
                  <div className="text-right">
                    <div className="mb-1" style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                      {t.paymentStatus}
                    </div>
                    {getPaymentStatusBadge(currentOrder)}
                  </div>
                </div>

                {/* Order Status */}
                <div className="mb-3 pb-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
                  <div className="mb-2" style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                    {t.status}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--gray-900)' }}>
                    {currentOrder.status}
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="mb-3 pb-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
                  <div className="space-y-1.5">
                    {currentOrder.items.map((item, index) => (
                      <div key={index} style={{ fontSize: '13px', color: 'var(--gray-700)' }}>
                        {item.quantity}× {item.menuItem.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total and Action */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ color: 'var(--gray-900)' }}>
                      ${currentOrder.total.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Action Buttons - Conditional based on payment status */}
                  {(currentOrder.paymentStatus === 'Unpaid' || currentOrder.paymentStatus === 'Failed') ? (
                    <div className="space-y-2">
                      {/* Primary: Pay Button */}
                      <button
                        onClick={() => onPayOrder(currentOrder)}
                        className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98"
                        style={{
                          backgroundColor: 'var(--orange-500)',
                          color: 'white',
                          minHeight: '48px',
                        }}
                      >
                        {t.payAmount} ${currentOrder.total.toFixed(2)}
                      </button>
                      
                      {/* Secondary: View Tracking */}
                      <button
                        onClick={() => onOrderClick(currentOrder)}
                        className="w-full py-3 px-4 rounded-full transition-all hover:bg-[var(--gray-100)] active:scale-98"
                        style={{
                          backgroundColor: 'white',
                          color: 'var(--orange-500)',
                          borderWidth: '2px',
                          borderColor: 'var(--orange-500)',
                          minHeight: '48px',
                        }}
                      >
                        {t.viewTracking}
                      </button>
                    </div>
                  ) : (
                    /* Paid: Only View Tracking */
                    <button
                      onClick={() => onOrderClick(currentOrder)}
                      className="w-full py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98"
                      style={{
                        backgroundColor: 'var(--orange-500)',
                        color: 'white',
                        minHeight: '48px',
                      }}
                    >
                      {t.viewTracking}
                    </button>
                  )}
                </div>
              </div>

              {/* Session Status Banners */}
              {showSessionNote && (
                <div 
                  className="mt-3 p-3 rounded-xl flex items-start gap-3"
                  style={{ backgroundColor: 'var(--blue-50)' }}
                >
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--blue-600)' }} />
                  <p style={{ color: 'var(--blue-700)', fontSize: '13px' }}>
                    {t.sessionNote}
                  </p>
                </div>
              )}

              {showSessionCompleted && (
                <div 
                  className="mt-3 p-3 rounded-xl flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--emerald-50)' }}
                >
                  <CheckCircle className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
                  <span style={{ color: 'var(--emerald-700)', fontSize: '14px' }}>
                    {t.sessionCompleted}
                  </span>
                </div>
              )}
            </>
          ) : (
            /* No Active Order */
            <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: 'var(--gray-200)' }}>
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--gray-100)' }}
              >
                <ClipboardList className="w-8 h-8" style={{ color: 'var(--gray-400)' }} />
              </div>
              <h3 className="mb-2" style={{ color: 'var(--gray-900)' }}>
                {t.noActiveOrder}
              </h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                {t.noActiveOrderDesc}
              </p>
            </div>
          )}
        </div>

        {/* Order History Section */}
        <div>
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
            {t.orderHistory}
          </h3>

          {!isLoggedIn ? (
            /* Sign in prompt for history */
            <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: 'var(--gray-200)' }}>
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--orange-100)' }}
              >
                <LogIn className="w-8 h-8" style={{ color: 'var(--orange-500)' }} />
              </div>
              <p className="mb-4" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                {t.signInPrompt}
              </p>
              <button
                onClick={onLogin}
                className="px-6 py-3 rounded-full transition-all hover:shadow-md active:scale-98"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  minHeight: '48px',
                }}
              >
                {t.signInButton}
              </button>
            </div>
          ) : orderHistory.length > 0 ? (
            /* Order history list */
            <div className="space-y-3">
              {orderHistory.map((order) => (
                <button
                  key={order.id}
                  onClick={() => onHistoryOrderClick(order)}
                  className="w-full bg-white rounded-xl border p-4 transition-all hover:shadow-md active:scale-98"
                  style={{ borderColor: 'var(--gray-200)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: 'var(--gray-900)' }}>
                          Order #{order.id}
                        </span>
                      </div>
                      <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                      {order.items.length} {t.items}
                    </span>
                    <span style={{ color: 'var(--gray-900)' }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* No past orders */
            <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: 'var(--gray-200)' }}>
              <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
                {t.noPastOrders}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}