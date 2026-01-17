/**
 * Session Expired Modal Component
 * Displays when customer session has expired
 */

'use client';

import React from 'react';
import { Clock, QrCode } from 'lucide-react';
import { ERROR_TEXT } from '@/constants/text';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onScanAgain: () => void;
  tenantName?: string;
}

export function SessionExpiredModal({
  isOpen,
  onScanAgain,
  tenantName = 'Restaurant',
}: SessionExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale-in">
        {/* Icon */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {ERROR_TEXT.sessionExpired}
        </h2>

        {/* Description */}
        <p className="text-gray-500 mb-6">
          {ERROR_TEXT.sessionExpiredDesc.replace('{tenantName}', tenantName)}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onScanAgain}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            aria-label={ERROR_TEXT.scanQRAgain}
          >
            <QrCode className="w-5 h-5" />
            {ERROR_TEXT.scanQRAgain}
          </button>
        </div>

        {/* Help text */}
        <p className="mt-4 text-xs text-gray-400">
          {ERROR_TEXT.contactSupport}
        </p>
      </div>
    </div>
  );
}
