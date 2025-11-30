'use client';

import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  } as const;

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  } as const;

  return (
    <div
      className={`fixed bottom-6 right-6 z-60 flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColors[type]} shadow-lg`}
      style={{ minWidth: '280px', maxWidth: '420px' }}
    >
      {icons[type]}
      <span className="flex-1 text-gray-900 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white rounded-lg transition-colors" aria-label="Close notification">
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}
