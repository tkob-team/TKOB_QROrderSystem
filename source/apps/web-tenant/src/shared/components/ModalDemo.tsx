'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAnimation } from '@/shared/hooks';

/**
 * Modern Frosted-Glass Modal Demo
 * 
 * This component demonstrates the modern modal design pattern used in the TKQR Admin UI.
 * 
 * Key Features:
 * - Frosted-glass overlay (rgba(255,255,255,0.4) + backdrop-blur)
 * - Smooth fade-in and scale-in animations
 * - Soft rounded corners (20px)
 * - Subtle elevation shadow
 * - Clean visual hierarchy
 * - Emerald green accent colors
 * 
 * Usage Pattern:
 * 1. Overlay uses white transparency + backdrop blur (not dark opaque)
 * 2. Modal animates with scale-in effect (0.96 → 1.0)
 * 3. Background remains visible but softened
 * 4. Maintains accessibility with proper focus management
 */

export interface ModalDemoProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function ModalDemo({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}: ModalDemoProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { scaleIn } = useAnimation();

  useEffect(() => {
    if (isOpen && modalRef.current) {
      scaleIn({ targets: modalRef.current, duration: 300 });
    }
  }, [isOpen, scaleIn]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md mx-4 animate-scale-in opacity-0"
        style={{
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 700 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">{children}</div>

        {/* Modal Footer */}
        {(primaryAction || secondaryAction) && (
          <div className="flex gap-3 p-6 border-t border-gray-200">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
