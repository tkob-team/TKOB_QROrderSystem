'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export interface ScreenNavigatorProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function ScreenNavigator({ currentScreen, onNavigate }: ScreenNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const screens = [
    { id: 'login', label: 'Login', category: 'Auth' },
    { id: 'signup', label: 'Signup', category: 'Auth' },
    { id: 'forgot-password', label: 'Forgot Password', category: 'Auth' },
    { id: 'reset-password', label: 'Reset Password', category: 'Auth' },
    { id: 'role-routing', label: 'Role Routing Diagram', category: 'Auth' },
    { id: 'email-verification', label: 'Email Verification', category: 'Auth' },
    { id: 'onboarding', label: 'Onboarding Wizard', category: 'Auth' },
    { id: 'dashboard', label: 'Dashboard', category: 'Admin' },
    { id: 'menu', label: 'Menu Management', category: 'Admin' },
    { id: 'menu-modifiers', label: 'Menu Item Modifiers', category: 'Admin' },
    { id: 'tables', label: 'Tables & QR', category: 'Admin' },
    { id: 'table-qr-detail', label: 'Table QR Detail', category: 'Admin' },
    { id: 'orders', label: 'Orders', category: 'Admin' },
    { id: 'staff', label: 'Staff Management', category: 'Admin' },
    { id: 'analytics', label: 'Analytics', category: 'Admin' },
    { id: 'settings', label: 'Tenant Profile', category: 'Admin' },
    { id: 'kds', label: 'KDS / KDS Board', category: 'KDS' },
    { id: 'service-board', label: 'Waiter / Service Board', category: 'Waiter' },
    { id: 'staff-invitation', label: 'Staff Invitation Signup', category: 'Staff' },
    { id: 'access-restricted', label: 'Access Restricted', category: 'Other' },
    { id: 'prototype-wiring', label: 'Prototype Wiring Notes', category: 'Design Notes' },
  ];

  const categories = ['Auth', 'Admin', 'KDS', 'Waiter', 'Staff', 'Other', 'Design Notes'];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all z-50 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Navigation Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-150 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
            <h3 className="text-gray-900">Screen Navigator</h3>
            <p className="text-gray-600" style={{ fontSize: '13px' }}>
              Current: {screens.find(s => s.id === currentScreen)?.label}
            </p>
          </div>
          
          <div className="p-4">
            {categories.map((category) => (
              <div key={category} className="mb-4">
                <h4 className="text-gray-900 mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>
                  {category}
                </h4>
                <div className="flex flex-col gap-1">
                  {screens
                    .filter((s) => s.category === category)
                    .map((screen) => (
                      <button
                        key={screen.id}
                        onClick={() => {
                          onNavigate(screen.id);
                          setIsOpen(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-left transition-all ${
                          currentScreen === screen.id
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        style={{ fontSize: '14px' }}
                      >
                        {screen.label}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}