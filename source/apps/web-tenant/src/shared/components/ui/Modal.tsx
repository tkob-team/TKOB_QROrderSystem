'use client';

import { X } from 'lucide-react';
import React from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
}

export function Modal({
  isOpen,
  title,
  description,
  onClose,
  size = 'md',
  children,
  footer,
  closeButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[size];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      <div
        className={`bg-white w-full ${maxWidthClass} flex flex-col animate-scale-in relative`}
        style={{
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
          <div className="flex flex-col gap-1">
            <h3 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 700 }}>
              {title}
            </h3>
            {description && (
              <p className="text-gray-600" style={{ fontSize: '14px' }}>
                {description}
              </p>
            )}
          </div>
          {closeButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer - Fixed */}
        {footer && (
          <div className="flex gap-3 p-6 border-t border-gray-200 shrink-0">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
