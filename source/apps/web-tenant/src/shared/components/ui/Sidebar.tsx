import React from 'react';
import { LayoutDashboard, Menu, QrCode, ShoppingBag, BarChart3, Users, Settings, MonitorPlay, ClipboardCheck } from 'lucide-react';

import type { AdminNavItem, AdminScreenId } from './AdminShell';

interface SidebarProps {
  activeItem: AdminNavItem;
  onNavigate: (item: AdminScreenId) => void;
}

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const topMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu', icon: Menu },
    { id: 'tables', label: 'Tables & QR', icon: QrCode },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  const operationsItems = [
    { id: 'kds', label: 'Kitchen Display', icon: MonitorPlay },
    { id: 'service-board', label: 'Service Board', icon: ClipboardCheck },
  ];

  const bottomMenuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'tenant-profile', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-gray-200 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-gray-900" style={{ fontSize: '20px' }}>TKQR</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col">
          {/* Top Menu Items */}
          {topMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as AdminScreenId)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span style={{ fontSize: '15px', fontWeight: 500 }}>{item.label}</span>
              </button>
            );
          })}

          {/* Operations Section */}
          <div className="mt-6 mb-3">
            {/* Section Label */}
            <div className="px-4 mb-3">
              <span 
                className="text-gray-400 uppercase tracking-[0.18em]" 
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                Operations
              </span>
            </div>

            {/* Operations Items (Secondary Style) */}
            <div className="flex flex-col">
              {operationsItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as AdminScreenId)}
                    className={`flex items-center gap-3 pl-8 pr-4 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Section Spacing */}
          <div className="pt-4 border-t border-gray-100 mt-2"></div>

          {/* Bottom Menu Items */}
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as AdminScreenId)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span style={{ fontSize: '15px', fontWeight: 500 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}