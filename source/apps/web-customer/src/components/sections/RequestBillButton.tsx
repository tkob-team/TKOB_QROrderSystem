'use client'

import { Receipt, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface RequestBillButtonProps {
  orderStatus: string;
  paymentStatus: string;
  language?: 'EN' | 'VI';
  tableSessionActive?: boolean;
}

export function RequestBillButton({ orderStatus, paymentStatus, language = 'EN', tableSessionActive = true }: RequestBillButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [billRequested, setBillRequested] = useState(false);

  const text = {
    EN: {
      requestBill: 'Request bill',
      billRequested: 'Bill requested',
      subtextUnpaid: 'Ask staff to prepare the bill',
      subtextPaid: 'Request a printed receipt or staff assistance',
      confirmTitle: 'Request the bill?',
      confirmMessageUnpaid: 'A staff member will bring the bill to your table shortly.',
      confirmMessagePaid: 'A staff member will assist you with a printed receipt or help close the table.',
      cancel: 'Cancel',
      confirm: 'Request bill',
      successMessage: 'Bill requested. Staff will assist you shortly.',
    },
    VI: {
      requestBill: 'Yêu cầu hóa đơn',
      billRequested: 'Đã yêu cầu',
      subtextUnpaid: 'Yêu cầu nhân viên chuẩn bị hóa đơn',
      subtextPaid: 'Yêu cầu in hóa đơn hoặc hỗ trợ đóng bàn',
      confirmTitle: 'Yêu cầu hóa đơn?',
      confirmMessageUnpaid: 'Nhân viên sẽ mang hóa đơn đến bàn của bạn ngay.',
      confirmMessagePaid: 'Nhân viên sẽ hỗ trợ in hóa đơn hoặc đóng bàn cho bạn.',
      cancel: 'Hủy',
      confirm: 'Yêu cầu hóa đơn',
      successMessage: 'Đã yêu cầu hóa đơn. Nhân viên sẽ hỗ trợ ngay.',
    },
  };

  const t = text[language];

  const isPaid = paymentStatus === 'Paid';
  const isUnpaid = paymentStatus === 'Unpaid' || paymentStatus === 'Failed';
  
  // Show button when:
  // - (Order is paid OR order status is Ready/Served) AND table session is active AND not cancelled
  const shouldShowButton = 
    tableSessionActive && 
    orderStatus !== 'Cancelled' &&
    (isPaid || orderStatus === 'Ready' || orderStatus === 'Served');

  if (!shouldShowButton) {
    return null;
  }

  const handleRequestBill = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setBillRequested(true);
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const subtext = isPaid ? t.subtextPaid : t.subtextUnpaid;
  const confirmMessage = isPaid ? t.confirmMessagePaid : t.confirmMessageUnpaid;

  return (
    <div className="my-6">
      {/* Request Bill Action Card */}
      {billRequested ? (
        // Success State Card
        <div 
          className="rounded-2xl p-5 border-2"
          style={{ 
            backgroundColor: 'var(--emerald-50)',
            borderColor: 'var(--emerald-200)',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--emerald-100)' }}
            >
              <CheckCircle className="w-6 h-6" style={{ color: 'var(--emerald-600)' }} />
            </div>
            <div className="flex-1 pt-1">
              <h4 className="mb-1" style={{ color: 'var(--emerald-900)', fontSize: '16px' }}>
                {t.billRequested}
              </h4>
              <p style={{ color: 'var(--emerald-700)', fontSize: '14px', lineHeight: '1.5' }}>
                {t.successMessage}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Request Bill Action Card
        <button
          onClick={handleRequestBill}
          className="w-full rounded-2xl p-5 border-2 transition-all active:scale-[0.98] text-left"
          style={{ 
            backgroundColor: 'var(--orange-50)',
            borderColor: 'var(--orange-200)',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)',
            borderLeftWidth: '4px',
            borderLeftColor: 'var(--orange-500)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--orange-100)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--orange-50)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--orange-200)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--orange-100)';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--orange-200)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--orange-50)';
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--orange-100)' }}
            >
              <Receipt className="w-6 h-6" style={{ color: 'var(--orange-600)' }} />
            </div>
            <div className="flex-1 pt-1">
              <h4 className="mb-1" style={{ color: 'var(--orange-900)', fontSize: '17px', fontWeight: '600' }}>
                {t.requestBill}
              </h4>
              <p style={{ color: 'var(--orange-700)', fontSize: '14px', lineHeight: '1.5' }}>
                {subtext}
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleCancel}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            <div className="text-center mb-6">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" 
                style={{ backgroundColor: 'var(--orange-100)' }}
              >
                <Receipt className="w-8 h-8" style={{ color: 'var(--orange-600)' }} />
              </div>
              <h3 className="mb-2" style={{ color: 'var(--gray-900)', fontSize: '20px' }}>
                {t.confirmTitle}
              </h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '15px', lineHeight: '1.5' }}>
                {confirmMessage}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full py-3.5 px-4 rounded-full transition-all hover:shadow-md active:scale-98"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  minHeight: '52px',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                {t.confirm}
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-3.5 px-4 rounded-full border-2 transition-all hover:bg-[var(--gray-50)] active:scale-98"
                style={{
                  borderColor: 'var(--gray-300)',
                  color: 'var(--gray-700)',
                  minHeight: '52px',
                  fontSize: '16px',
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}