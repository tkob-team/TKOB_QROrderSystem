/**
 * Service Header Section
 * Minimalist header - WebSocket handles real-time updates automatically
 */

'use client';

import React from 'react';
import { Plus, LogOut } from 'lucide-react';

interface ServiceHeaderProps {
  userRole?: 'admin' | 'waiter' | 'kds';
  onManualOrder?: () => void;
  onLogout: () => void;
}

/**
 * ServiceHeaderMobile Component
 */
export function ServiceHeaderMobile({
  onLogout,
}: Omit<ServiceHeaderProps, 'userRole' | 'onManualOrder'>) {
  return (
    <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-default px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-text-primary truncate text-[17px] font-bold">
          Service Board
        </h1>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Profile Link */}
          <a
            href="/waiter/profile"
            className="flex items-center justify-center w-11 h-11 bg-white border border-default text-text-secondary rounded-lg active:bg-elevated hover:bg-elevated"
            aria-label="Profile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </a>
          
          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-11 h-11 bg-white border border-default text-red-500 rounded-lg active:bg-elevated hover:bg-red-50"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ServiceHeaderDesktop Component
 */
export function ServiceHeaderDesktop({
  userRole,
  onManualOrder,
  onLogout,
}: ServiceHeaderProps) {
  return (
    <div className="hidden lg:block bg-white border-b border-default px-6 py-4">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        {/* Left: Title */}
        <div>
          <h2 className="text-text-primary text-2xl font-bold">Service Board</h2>
          <p className="text-text-secondary text-sm">
            Manage orders from placement to service
          </p>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Manual Order - Admin only */}
          {userRole === 'admin' && onManualOrder && (
            <button
              onClick={onManualOrder}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-elevated border-2 border-default text-text-secondary rounded-lg transition-all text-sm font-semibold min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Manual Order</span>
            </button>
          )}
          
          {/* Profile Link */}
          <a
            href="/waiter/profile"
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-elevated border-2 border-default text-text-secondary rounded-lg transition-all text-sm font-semibold min-h-[40px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">Profile</span>
          </a>
          
          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 border-2 border-red-200 text-red-600 rounded-lg transition-all text-sm font-semibold min-h-[40px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
