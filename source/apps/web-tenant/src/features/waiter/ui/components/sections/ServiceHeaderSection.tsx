/**
 * Service Header Section
 * Mobile and Desktop header components
 * Presentational only - accepts props, no hooks or data access
 */

'use client';

import React from 'react';
import { Badge } from '@/shared/components';
import { Bell, BellOff, RefreshCw, Plus } from 'lucide-react';

interface ServiceHeaderProps {
  soundEnabled: boolean;
  autoRefresh: boolean;
  userRole?: 'admin' | 'waiter' | 'kds';
  onToggleSound: () => void;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onManualOrder?: () => void;
}

/**
 * ServiceHeaderMobile Component
 * Icon-only controls for mobile view
 */
export function ServiceHeaderMobile({
  soundEnabled,
  autoRefresh,
  onToggleSound,
  onToggleAutoRefresh,
  onRefresh,
}: Omit<ServiceHeaderProps, 'userRole' | 'onManualOrder'>) {
  return (
    <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-default px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Title + Live Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-text-primary truncate text-[17px] font-bold">
            Service Board
          </h1>
          {autoRefresh && (
            <Badge variant="success">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
                <span className="text-[10px]">Live</span>
              </span>
            </Badge>
          )}
        </div>

        {/* Right: Icon-only Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Auto Toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`flex items-center justify-center w-11 h-11 border rounded-lg transition-all ${
              autoRefresh
                ? 'border-accent-500 bg-accent-50 text-accent-600'
                : 'border-default bg-white text-text-secondary active:bg-elevated'
            }`}
            aria-label={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            <RefreshCw
              className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`}
              style={{ animationDuration: '3s' }}
            />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center justify-center w-11 h-11 border rounded-lg transition-all ${
              soundEnabled
                ? 'border-accent-500 bg-accent-50 text-accent-600'
                : 'border-default bg-white text-text-secondary active:bg-elevated'
            }`}
            aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            className="flex items-center justify-center w-11 h-11 bg-white border border-default text-text-secondary rounded-lg active:bg-elevated"
            aria-label="Refresh orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ServiceHeaderDesktop Component
 * Full-featured header with labeled controls for desktop view
 */
export function ServiceHeaderDesktop({
  soundEnabled,
  autoRefresh,
  userRole,
  onToggleSound,
  onToggleAutoRefresh,
  onRefresh,
  onManualOrder,
}: ServiceHeaderProps) {
  return (
    <div className="hidden lg:block bg-white border-b border-default px-6 py-4">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        {/* Left: Title + Subtitle + Live Badge */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-text-primary text-2xl font-bold">
                Service Board
              </h2>
              {autoRefresh && (
                <Badge variant="success">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </Badge>
              )}
            </div>
            <p className="text-text-secondary text-sm">
              Manage orders from placement to service
            </p>
          </div>
        </div>

        {/* Right: Labeled Controls */}
        <div className="flex items-center gap-3">
          {/* Auto/Live Toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all text-sm font-semibold min-h-[40px] ${
              autoRefresh
                ? 'border-accent-500 bg-accent-50 text-accent-600'
                : 'border-default bg-white text-text-secondary hover:bg-elevated'
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`}
              style={{ animationDuration: '3s' }}
            />
            <span className="hidden sm:inline">{autoRefresh ? 'Live' : 'Auto'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all text-sm font-semibold min-h-[40px] ${
              soundEnabled
                ? 'border-accent-500 bg-accent-50 text-accent-600'
                : 'border-default bg-white text-text-secondary hover:bg-elevated'
            }`}
          >
            {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-elevated border-2 border-default text-text-secondary rounded-lg transition-all text-sm font-semibold min-h-[40px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

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
        </div>
      </div>
    </div>
  );
}
