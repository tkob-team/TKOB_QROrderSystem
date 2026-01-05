/**
 * Sidebar Component - Smart Restaurant Design
 * White background with GREEN active states
 * Logo + Greeting at top, collapse button below
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  QrCode,
  ShoppingBag,
  BarChart3,
  Users,
  Settings,
  MonitorPlay,
  ClipboardCheck,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  UtensilsCrossed,
} from 'lucide-react';
import type { AdminNavItem, AdminScreenId } from './AdminShell';

export interface SidebarProps {
  activeItem: AdminNavItem;
  onNavigate: (item: AdminScreenId) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  userRole?: string;
}

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 🌇';
  if (hour < 17) return 'Good afternoon 🌆';
  return 'Good evening 🌃';
}

export function Sidebar({
  activeItem,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  userRole = 'Owner',
}: SidebarProps) {
  // Memoize greeting to prevent unnecessary recalculations
  const fullGreeting = useMemo(() => getGreeting(), []);
  
  // Typing animation state
  const [displayedGreeting, setDisplayedGreeting] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);
  
  // Typing animation effect - triggers when sidebar expands
  useEffect(() => {
    if (collapsed) {
      setShowGreeting(false);
      setDisplayedGreeting('');
      return;
    }
    
    // Small delay before starting animation
    const startDelay = setTimeout(() => {
      setShowGreeting(true);
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullGreeting.length) {
          setDisplayedGreeting(fullGreeting.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 40); // 40ms per character
      
      return () => clearInterval(typingInterval);
    }, 300); // Wait for sidebar to expand
    
    return () => clearTimeout(startDelay);
  }, [collapsed, fullGreeting]);

  // Menu items
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Management', icon: CheckSquare },
    { id: 'tables', label: 'Tables & QR', icon: QrCode },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  const operationsItems = [
    { id: 'kds', label: 'Kitchen View (KDS)', icon: MonitorPlay },
    { id: 'service-board', label: 'Service Board', icon: ClipboardCheck },
  ];

  const bottomMenuItems = [
    { id: 'analytics', label: 'Reports', icon: BarChart3 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'tenant-profile', label: 'Settings', icon: Settings },
  ];

  // Render menu item
  const renderMenuItem = (
    item: { id: string; label: string; icon: React.ComponentType<{ className?: string }> },
    size: 'normal' | 'small' = 'normal'
  ) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    const py = size === 'normal' ? 'py-3' : 'py-2.5';
    const iconSize = size === 'normal' ? 'w-5 h-5' : 'w-[18px] h-[18px]';
    const textSize = size === 'normal' ? 'text-[15px]' : 'text-sm';

    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id as AdminScreenId)}
        className={`
          flex items-center gap-3 px-4 ${py} rounded-lg transition-all duration-200 group w-full overflow-hidden
          ${isActive
            ? 'bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25'
            : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
          }
        `}
        title={collapsed ? item.label : undefined}
      >
        <Icon
          className={`shrink-0 ${iconSize} transition-all ${isActive ? 'stroke-[2.5]' : 'group-hover:scale-110'}`}
        />
        <span 
          className={`${textSize} whitespace-nowrap transition-all duration-300 ${
            collapsed ? 'opacity-0 w-0' : 'opacity-100'
          }`}
        >
          {item.label}
        </span>
        {isActive && !collapsed && (
          <ChevronRight className="w-4 h-4 ml-auto opacity-80 shrink-0" />
        )}
      </button>
    );
  };

  return (
    <aside
      className={`
        hidden md:flex flex-col bg-white border-r border-gray-200 
        transition-all duration-500 ease-in-out shrink-0 h-full
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo + Greeting Section - AT TOP */}
      {!collapsed && (
        <div className="shrink-0 p-4 border-b border-gray-100">
          {/* Logo Icon + Brand */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-semibold text-gray-900 leading-tight">
                TKOB
              </span>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider">
                Restaurant
              </span>
            </div>
          </div>
          {/* Greeting with typing animation */}
          <div className="px-1 h-6 overflow-hidden">
            {showGreeting && (
              <p className="text-sm text-gray-600">
                <span className="inline-block">{displayedGreeting}</span>
                {displayedGreeting.length < fullGreeting.length && (
                  <span className="inline-block w-0.5 h-4 bg-emerald-500 ml-0.5 animate-pulse" />
                )}
                {displayedGreeting === fullGreeting && (
                  <span className="font-medium text-emerald-600">, {userRole}</span>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Collapsed state - just icon */}
      {collapsed && (
        <div className="shrink-0 p-3 border-b border-gray-100 flex justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="shrink-0 px-3 py-2">
        <button
          onClick={onToggleCollapse}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg w-full
            text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all
            ${collapsed ? 'justify-center' : ''}
          `}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {/* Main Menu Section */}
          {!collapsed && (
            <div className="px-4 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Main Menu
              </span>
            </div>
          )}
          {mainMenuItems.map((item) => renderMenuItem(item))}

          {/* Operations Section */}
          <div className="mt-6">
            {!collapsed && (
              <div className="px-4 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Operations
                </span>
              </div>
            )}
            {operationsItems.map((item) => renderMenuItem(item, 'small'))}
          </div>

          {/* Divider */}
          <div className="my-4 mx-3 border-t border-gray-100"></div>

          {/* Settings & Reports Section */}
          {!collapsed && (
            <div className="px-4 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Settings & Reports
              </span>
            </div>
          )}
          {bottomMenuItems.map((item) => renderMenuItem(item))}
        </div>
      </nav>
    </aside>
  );
}