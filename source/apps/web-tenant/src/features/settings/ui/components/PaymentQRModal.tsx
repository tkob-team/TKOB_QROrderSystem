/**
 * Payment QR Modal Component
 * Displays SePay QR code and handles payment polling
 */

'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { usePaymentPolling } from '../../hooks';
import { logger } from '@/shared/utils/logger';

interface PaymentQRModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;
  /**
   * Close modal
   */
  onClose: () => void;
  /**
   * Payment details
   */
  payment: {
    paymentId: string;
    qrCodeUrl: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    content: string;
  };
  /**
   * Target plan name
   */
  planName: string;
  /**
   * Callback on payment confirmed
   */
  onPaymentConfirmed: () => void;
}

export function PaymentQRModal({
  isOpen,
  onClose,
  payment,
  planName,
  onPaymentConfirmed,
}: PaymentQRModalProps) {
  const {
    status,
    attempt,
    maxAttempts,
    progress,
    startPolling,
    stopPolling,
    reset,
  } = usePaymentPolling({
    paymentId: payment.paymentId,
    enabled: isOpen,
    interval: 3000, // Poll every 3 seconds (safe for SePay rate limit)
    maxAttempts: 60, // 1 minute total (20 × 3s = 60s)
    onSuccess: () => {
      logger.info('[payment-modal] Payment confirmed');
      onPaymentConfirmed();
    },
    onTimeout: () => {
      logger.warn('[payment-modal] Payment verification timeout');
    },
    onError: (error) => {
      logger.error('[payment-modal] Payment verification error', { 
        message: error.message 
      });
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Auto-start polling when modal opens
  useEffect(() => {
    if (isOpen) {
      logger.info('[payment-modal] Modal opened, auto-starting payment verification');
      startPolling();
    } else {
      reset();
    }
  }, [isOpen, startPolling, reset]);

  if (!isOpen) return null;

  const handleStartPolling = () => {
    logger.info('[payment-modal] User clicked "I have paid"');
    startPolling();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Upgrade to {planName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Messages */}
          {status === 'confirmed' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Payment Confirmed!</p>
                <p className="text-sm text-green-700">
                  Your subscription has been upgraded successfully.
                </p>
              </div>
            </div>
          )}

          {status === 'timeout' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Verification Timeout</p>
                <p className="text-sm text-yellow-700">
                  Payment verification timed out. Please check your transaction or try again.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Verification Error</p>
                <p className="text-sm text-red-700">
                  Failed to verify payment. Please contact support.
                </p>
              </div>
            </div>
          )}

          {status === 'polling' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
                  <p className="font-semibold text-blue-900">Verifying Payment...</p>
                </div>
                <span className="text-sm text-blue-700">
                  {attempt}/{maxAttempts}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-2">
                This may take up to 1 minute. Please don&apos;t close this window.
              </p>
            </div>
          )}

          {/* Payment Information */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-xs aspect-square bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center">
                {payment.qrCodeUrl ? (
                  <Image
                    src={payment.qrCodeUrl}
                    alt="Payment QR Code"
                    width={300}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400">QR Code Loading...</div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center">
                Scan with your banking app
              </p>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account
                </label>
                <p className="text-base font-mono font-semibold text-gray-900">
                  {payment.accountNumber}
                </p>
                <p className="text-sm text-gray-600">{payment.accountName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(payment.amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Content
                </label>
                <p className="text-sm font-mono bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-900">
                  {payment.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Copy this content exactly when transferring
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-2">Instructions:</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Scan QR code or enter account manually</li>
                  <li>Verify the amount is correct</li>
                  <li>Copy transfer content exactly</li>
                  <li>Complete the transfer</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          {status === 'confirmed' ? (
            <button
              onClick={onClose}
              className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Done
            </button>
          ) : status === 'timeout' || status === 'error' ? (
            <button
              onClick={handleStartPolling}
              disabled={status === 'polling'}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {status === 'polling' && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Retry Verification
            </button>
          ) : (
            <div className="px-6 py-2 text-sm text-gray-600 flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
              Automatically checking payment...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
