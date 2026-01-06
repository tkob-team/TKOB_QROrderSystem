/**
 * Waiter Service Board - UI Components
 * ServiceHeader, ServiceTabs, EmptyState
 */

'use client';

import React from 'react';
import { Badge } from '@/shared/components';
import { Bell, BellOff, RefreshCw, Plus, ChevronDown } from 'lucide-react';
import type { OrderStatus, ServiceTab, ServiceTabCounts } from '../types';
import { SERVICE_TABS } from '../constants';

/**
 * ServiceHeader Props
 */
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
 * ServiceHeader Component (Mobile)
 * Sticky header with title, live badge, and icon-only controls
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
 * ServiceHeader Component (Desktop)
 * Full-width header with title, subtitle, and labeled controls
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

/**
 * ServiceTabs Props
 */
interface ServiceTabsProps {
  activeTab: OrderStatus;
  tabCounts: ServiceTabCounts;
  userRole?: 'admin' | 'waiter' | 'kds';
  onTabChange: (status: OrderStatus) => void;
  onManualOrder?: () => void;
}

/**
 * ServiceTabs Component
 * Mobile: Dropdown selector for better UX
 * Desktop: Horizontal tabs with counts
 */
export function ServiceTabs({
  activeTab,
  tabCounts,
  userRole,
  onTabChange,
  onManualOrder,
}: ServiceTabsProps) {
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = React.useState(false);
  const activeTabData = SERVICE_TABS.find(t => t.id === activeTab);

  return (
    <div
      className="sticky top-0 lg:top-0 z-10 bg-white border-b border-gray-200 shadow-sm"
      style={{ top: 'var(--mobile-header-height, 0px)' }}
    >
      {/* Mobile: Dropdown Selector */}
      <div className="lg:hidden px-4 py-3">
        <div className="relative">
          <button
            onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-left"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900">{activeTabData?.label || 'Select'}</span>
              {tabCounts[activeTab] > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  {tabCounts[activeTab]}
                </span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isMobileDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMobileDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {SERVICE_TABS.map((tab) => {
                  const count = tabCounts[tab.id];
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsMobileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{tab.label}</span>
                      {count > 0 && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Mobile: Quick Action Buttons */}
        {userRole === 'waiter' && onManualOrder && (
          <button
            onClick={onManualOrder}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Order</span>
          </button>
        )}
      </div>

      {/* Desktop: Horizontal Tabs */}
      <div className="hidden lg:block overflow-x-auto scrollbar-hide">
        <div className="flex px-6 min-w-max max-w-[1600px] mx-auto">
          {SERVICE_TABS.map((tab) => {
            const count = tabCounts[tab.id];
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap text-sm ${
                  isActive
                    ? 'border-emerald-500 text-emerald-600 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 font-semibold'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center ${
                      isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Manual Order CTA - Waiter only */}
          {userRole === 'waiter' && onManualOrder && (
            <button
              onClick={onManualOrder}
              className="flex items-center gap-1.5 px-4 py-3 border-b-2 border-transparent transition-all whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 text-emerald-600 ml-2 rounded-t-lg text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Order</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

/**
 * EmptyOrdersState Props
 */
interface EmptyOrdersStateProps {
  activeTab: OrderStatus;
}

/**
 * EmptyOrdersState Component
 * Display when no orders in current tab
 */
export function EmptyOrdersState({ activeTab }: EmptyOrdersStateProps) {
  const tab = SERVICE_TABS.find((t) => t.id === activeTab);

  return (
    <div
      className="p-12 text-center bg-white rounded-lg shadow-sm"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h4 className="text-text-primary mb-2 text-lg font-semibold">
          No orders
        </h4>
        <p className="text-text-secondary text-[15px]">
          No {tab?.label.toLowerCase()} orders at the moment
        </p>
      </div>
    </div>
  );
}
