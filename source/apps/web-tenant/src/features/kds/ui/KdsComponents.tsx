/**
 * KDS Components - Extracted from KdsBoardPage
 * Components: KdsHeaderBar, KdsSummaryPills, KdsColumn
 */

'use client';

import React from 'react';
import { Badge } from '@/shared/components/Badge';
import { Card } from '@/shared/components/Card';
import { Bell, BellOff, RefreshCw, Clock, ChevronDown, LogOut, Check } from 'lucide-react';
import type { KdsColumnConfig, KdsSummaryCounts } from '../types';
import { formatKdsTime } from '../constants';

/**
 * KdsHeaderBar Props
 */
interface KdsHeaderBarProps {
  currentTime: Date | null;
  soundEnabled: boolean;
  autoRefresh: boolean;
  showKdsProfile: boolean;
  isUserMenuOpen: boolean;
  userMenuRef: React.RefObject<HTMLDivElement>;
  onToggleSound: () => void;
  onToggleAutoRefresh: () => void;
  onToggleUserMenu: () => void;
  onLogout: () => void;
}

/**
 * KDS Header Bar
 * Top bar with clock, toggles (sound/auto-refresh), and user menu
 */
export function KdsHeaderBar({
  currentTime,
  soundEnabled,
  autoRefresh,
  showKdsProfile,
  isUserMenuOpen,
  userMenuRef,
  onToggleSound,
  onToggleAutoRefresh,
  onToggleUserMenu,
  onLogout,
}: KdsHeaderBarProps) {
  return (
    <div className="bg-secondary border-b border-default">
      {/* Main Header */}
      <div className="h-16 flex items-center justify-between px-6">
        {/* Left - Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
              <span style={{ fontSize: '20px' }}>👨‍🍳</span>
            </div>
            <div>
              <h2 className="text-text-primary" style={{ fontSize: '20px', fontWeight: 700 }}>
                Kitchen Display
              </h2>
              <p className="text-text-tertiary" style={{ fontSize: '13px' }}>
                Live order status
              </p>
            </div>
          </div>
          <Badge variant="success">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </Badge>
        </div>

        {/* Center - Live Clock (lg+ only) */}
        <div className="hidden lg:flex items-center justify-center">
          <div
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-elevated to-secondary rounded-lg border-2 border-default"
          >
            <Clock className="w-5 h-5 text-text-tertiary" />
            <span
              className="text-text-primary"
              suppressHydrationWarning
              style={{
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '0.02em',
              }}
            >
              {currentTime ? formatKdsTime(currentTime) : '--:--:--'}
            </span>
          </div>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              soundEnabled
                ? 'bg-green-500/10 text-green-500 border-2 border-green-500/20'
                : 'bg-elevated text-text-tertiary border-2 border-default'
            }`}
            style={{ fontSize: '14px', fontWeight: 600, height: '40px' }}
            title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
          >
            {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Sound</span>
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              autoRefresh
                ? 'bg-green-500/10 text-green-500 border-2 border-green-500/20'
                : 'bg-elevated text-text-tertiary border-2 border-default'
            }`}
            style={{ fontSize: '14px', fontWeight: 600, height: '40px' }}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <RefreshCw
              className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`}
              style={{ animationDuration: '3s' }}
            />
            <span className="hidden sm:inline">Auto</span>
          </button>

          {/* User Menu */}
          {showKdsProfile && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={onToggleUserMenu}
                className="flex items-center gap-2 pl-4 border-l-2 border-default hover:bg-elevated rounded-lg transition-colors py-2 pr-2"
              >
                <div className="w-9 h-9 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-amber-500" style={{ fontSize: '14px', fontWeight: 700 }}>
                    KS
                  </span>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-text-primary" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Kitchen Staff
                  </span>
                  <span className="text-text-tertiary" style={{ fontSize: '12px' }}>
                    KDS View
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-text-tertiary transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-secondary rounded-lg border border-default shadow-lg py-2 z-50">
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2.5 text-left hover:bg-red-500/10 transition-colors flex items-center gap-3 group"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span
                      className="text-red-500 group-hover:text-red-600"
                      style={{ fontSize: '14px', fontWeight: 500 }}
                    >
                      Log out
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * KdsSummaryPills Props
 */
interface KdsSummaryPillsProps {
  counts: KdsSummaryCounts;
}

/**
 * KDS Summary Pills
 * Status summary dashboard bar (pending, cooking, ready, overdue)
 */
export function KdsSummaryPills({ counts }: KdsSummaryPillsProps) {
  return (
    <div className="hidden lg:block border-t border-default bg-secondary px-6 py-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Pending Status Card */}
          <div
            className="flex-1 flex items-center justify-between px-5 py-3 bg-blue-500/10 rounded-lg border-2 border-blue-500/20"
            style={{
              minHeight: '48px',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-blue-400" style={{ fontSize: '15px', fontWeight: 600 }}>
                Pending
              </span>
            </div>
            <span className="text-blue-500" style={{ fontSize: '22px', fontWeight: 800 }}>
              {counts.pending}
            </span>
          </div>

          {/* Cooking Status Card */}
          <div
            className="flex-1 flex items-center justify-between px-5 py-3 bg-amber-500/10 rounded-lg border-2 border-amber-500/20"
            style={{
              minHeight: '48px',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <span className="text-amber-400" style={{ fontSize: '15px', fontWeight: 600 }}>
                Cooking
              </span>
            </div>
            <span className="text-amber-500" style={{ fontSize: '22px', fontWeight: 800 }}>
              {counts.cooking}
            </span>
          </div>

          {/* Ready Status Card */}
          <div
            className="flex-1 flex items-center justify-between px-5 py-3 bg-green-500/10 rounded-lg border-2 border-green-500/20"
            style={{
              minHeight: '48px',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-green-400" style={{ fontSize: '15px', fontWeight: 600 }}>
                Ready
              </span>
            </div>
            <span className="text-green-500" style={{ fontSize: '22px', fontWeight: 800 }}>
              {counts.ready}
            </span>
          </div>

          {/* Overdue Status Card - Only show if there are overdue orders */}
          {counts.overdue > 0 && (
            <div
              className="flex-1 flex items-center justify-between px-5 py-3 bg-red-500/20 rounded-lg border-2 border-red-500/40"
              style={{
                minHeight: '48px',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-slow" />
                <span className="text-red-400" style={{ fontSize: '15px', fontWeight: 700 }}>
                  Overdue
                </span>
              </div>
              <span className="text-red-500" style={{ fontSize: '22px', fontWeight: 900 }}>
                {counts.overdue}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * KdsColumn Props
 */
interface KdsColumnProps {
  column: KdsColumnConfig;
  orderCount: number;
  children: React.ReactNode;
}

/**
 * KDS Column
 * Column header + order cards container
 */
export function KdsColumn({ column, orderCount, children }: KdsColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Column Header */}
      <div className={`${column.bgColor} rounded-lg p-4 border-2 ${column.borderColor}`}>
        <div className="flex items-center justify-between">
          <h3
            className={column.textColor}
            style={{
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {column.title}
          </h3>
          <span
            className={`${column.badgeBg} text-white px-3 py-1 rounded-full`}
            style={{ fontSize: '14px', fontWeight: 700 }}
          >
            {orderCount}
          </span>
        </div>
      </div>

      {/* Order Cards */}
      <div className="flex flex-col gap-4 min-h-[400px]">{children}</div>
    </div>
  );
}

/**
 * KdsEmptyColumn Props
 */
interface KdsEmptyColumnProps {
  column: KdsColumnConfig;
}

/**
 * Empty state for KDS column
 */
export function KdsEmptyColumn({ column }: KdsEmptyColumnProps) {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center justify-center text-text-tertiary">
        <div
          className={`w-16 h-16 ${column.bgColor} rounded-full flex items-center justify-center mb-3`}
        >
          <Check className={`w-8 h-8 ${column.textColor}`} />
        </div>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>
          No orders {column.title.toLowerCase()}
        </p>
      </div>
    </Card>
  );
}
