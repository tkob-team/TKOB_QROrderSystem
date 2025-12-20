'use client'

import { ArrowLeft, CheckCircle, Calendar, MapPin, FileText, CreditCard, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Language } from '@/types';
import { useState } from 'react';
import { LanguageSwitcher } from '@/components';
import { RequestBillButton } from '@/components';
import { OrderService } from '@/api/services/order.service';

interface OrderDetailHistoryProps {
  orderId: string;
}

export function OrderDetailPage({ orderId }: OrderDetailHistoryProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('EN');
  
  // Fetch order data
  const { data: orderResponse, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrder(orderId)
  });
  
  const order = orderResponse?.data;

  const text = {
    EN: {
      title: 'Order Details',
      orderId: 'Order',
      date: 'Date',
      table: 'Table',
      status: 'Status',
      completed: 'Completed',
      orderedItems: 'Ordered Items',
      quantity: 'Qty',
      size: 'Size',
      toppings: 'Add-ons',
      specialInstructions: 'Special Instructions',
      notes: 'Order Notes',
      noNotes: 'No notes',
      priceSummary: 'Price Summary',
      subtotal: 'Subtotal',
      tax: 'Tax',
      serviceCharge: 'Service charge',
      total: 'Total',
      paymentInfo: 'Payment Information',
      paymentMethod: 'Payment method',
      paymentStatus: 'Payment status',
      paidByCard: 'Paid by card',
      payAtCounter: 'Pay at counter',
      paid: 'Paid',
      unpaid: 'Unpaid',
    },
    VI: {
      title: 'Chi tiết đơn hàng',
      orderId: 'Đơn hàng',
      date: 'Ngày',
      table: 'Bàn',
      status: 'Trạng thái',
      completed: 'Đã hoàn thành',
      orderedItems: 'Món đã đặt',
      quantity: 'SL',
      size: 'Kích cỡ',
      toppings: 'Topping',
      specialInstructions: 'Yêu cầu đặc biệt',
      notes: 'Ghi chú đơn hàng',
      noNotes: 'Không có ghi chú',
      priceSummary: 'Tóm tắt giá',
      subtotal: 'Tạm tính',
      tax: 'Thuế',
      serviceCharge: 'Phí dịch vụ',
      total: 'Tổng cộng',
      paymentInfo: 'Thông tin thanh toán',
      paymentMethod: 'Phương thức',
      paymentStatus: 'Trạng thái',
      paidByCard: 'Đã thanh toán bằng thẻ',
      payAtCounter: 'Thanh toán tại quầy',
      paid: 'Đã thanh toán',
      unpaid: 'Chưa thanh toán',
    },
  };

  const t = text[language];
  
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
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p style={{ color: 'var(--gray-900)' }} className="text-xl mb-2">Order not found</p>
          <p style={{ color: 'var(--gray-600)' }} className="mb-4">The order you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-full"
            style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemPrice = (item: typeof order.items[0]) => {
    let price = item.menuItem.basePrice;
    
    if (item.selectedSize && item.menuItem.sizes) {
      const size = item.menuItem.sizes.find(s => s.size === item.selectedSize);
      if (size) price = size.price;
    }
    
    if (item.menuItem.toppings) {
      item.selectedToppings.forEach(toppingId => {
        const topping = item.menuItem.toppings!.find(t => t.id === toppingId);
        if (topping) price += topping.price;
      });
    }
    
    return price;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
            </button>
            <h2 style={{ color: 'var(--gray-900)' }}>{t.title}</h2>
          </div>
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        {/* Order Info Card */}
        <div className="bg-white rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.orderId}</span>
            </div>
            <span style={{ color: 'var(--gray-900)' }}>#{order.id}</span>
          </div>

          <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.date}</span>
            </div>
            <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>{formatDate(order.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.table}</span>
            </div>
            <span style={{ color: 'var(--gray-900)' }}>{order.tableNumber}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.status}</span>
            </div>
            <span 
              className="px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: 'var(--emerald-100)', 
                color: 'var(--emerald-700)',
                fontSize: '13px'
              }}
            >
              {t.completed}
            </span>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="mb-4">
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
            {t.orderedItems}
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border p-4"
                style={{ borderColor: 'var(--gray-200)' }}
              >
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 style={{ color: 'var(--gray-900)' }}>
                        {item.quantity} × {item.menuItem.name}
                      </h4>
                      <span style={{ color: 'var(--gray-900)' }}>
                        ${(getItemPrice(item) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Size */}
                    {item.selectedSize && (
                      <div className="mb-2">
                        <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                          {t.size}: <span style={{ color: 'var(--gray-900)' }}>{item.selectedSize}</span>
                        </span>
                      </div>
                    )}

                    {/* Toppings */}
                    {item.selectedToppings.length > 0 && (
                      <div className="mb-2">
                        <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                          {t.toppings}:{' '}
                        </span>
                        {item.selectedToppings.map((toppingId) => {
                          const topping = item.menuItem.toppings?.find((t) => t.id === toppingId);
                          return topping ? (
                            <span
                              key={toppingId}
                              className="inline-block mr-2 px-2 py-1 rounded"
                              style={{
                                backgroundColor: 'var(--orange-100)',
                                color: 'var(--orange-700)',
                                fontSize: '12px',
                              }}
                            >
                              {topping.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--gray-200)' }}>
                        <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>
                          {t.specialInstructions}:
                        </p>
                        <p style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
                          {item.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="bg-white rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--gray-200)' }}>
            <h3 className="mb-2" style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
              {t.notes}
            </h3>
            <p style={{ color: 'var(--gray-700)', fontSize: '14px' }}>
              {order.notes}
            </p>
          </div>
        )}

        {/* Price Summary */}
        <div className="bg-white rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--gray-200)' }}>
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
            {t.priceSummary}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.subtotal}</span>
              <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
                ${order.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.tax}</span>
              <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
                ${order.tax.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.serviceCharge}</span>
              <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
                ${order.serviceCharge.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span style={{ color: 'var(--gray-900)' }}>{t.total}</span>
              <span style={{ color: 'var(--gray-900)' }}>
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--gray-200)' }}>
          <h3 className="mb-3" style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
            {t.paymentInfo}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--gray-200)' }}>
              <div className="flex items-center gap-2">
                {order.paymentMethod === 'card' ? (
                  <CreditCard className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
                ) : (
                  <Wallet className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
                )}
                <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.paymentMethod}</span>
              </div>
              <span style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
                {order.paymentMethod === 'card' ? t.paidByCard : t.payAtCounter}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{t.paymentStatus}</span>
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: order.paymentMethod === 'card' ? 'var(--emerald-100)' : 'var(--orange-100)',
                  color: order.paymentMethod === 'card' ? 'var(--emerald-700)' : 'var(--orange-700)',
                  fontSize: '13px',
                }}
              >
                <CheckCircle className="w-4 h-4" />
                {order.paymentMethod === 'card' ? t.paid : t.unpaid}
              </span>
            </div>
          </div>
        </div>

        {/* Request Bill Button */}
        <RequestBillButton 
          orderStatus={order.status}
          paymentStatus={order.paymentStatus}
          language={language}
          tableSessionActive={true}
        />
      </div>
    </div>
  );
}