/**
 * Service Tabs Section
 * Mobile dropdown and desktop horizontal tab navigation
 * Presentational only - accepts props, no hooks or data access
 */

'use client';

import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import type { OrderStatus, ServiceTabCounts } from '../../../model/types';
import { SERVICE_TABS } from '../../../model/constants';

interface ServiceTabsProps {
  activeTab: OrderStatus;
  tabCounts: ServiceTabCounts;
  userRole?: 'admin' | 'waiter' | 'kds';
  onTabChange: (status: OrderStatus) => void;
  onManualOrder?: () => void;
}

/**
 * ServiceTabsSection Component
 * Mobile: Dropdown selector for better UX
 * Desktop: Horizontal tabs with counts
 */
export function ServiceTabsSection({
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
