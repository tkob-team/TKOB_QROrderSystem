/**
 * UserMenu Component - Smart Restaurant Design
 * Supports both light and dark (green header) variants
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import type { AdminScreenId } from './AdminShell';

export interface UserMenuProps {
  onNavigate?: (screen: AdminScreenId) => void;
  /** 'light' for white bg, 'dark' for green bg */
  variant?: 'light' | 'dark';
}

export function UserMenu({ onNavigate, variant = 'light' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const userName = user?.name || 'Admin User';
  const userRole =
    user?.role === 'admin' || user?.role === 'kds' || user?.role === 'waiter'
      ? 'Admin'
      : 'Staff';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const isDark = variant === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleAccountSettings = () => {
    setIsOpen(false);
    onNavigate?.('account-settings');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors
          ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}
        `}
      >
        {/* Avatar - rounded-lg for softer look */}
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
          ${isDark ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}
        `}>
          {initials}
        </div>

        {/* Name + Chevron */}
        <div className="hidden md:flex items-center gap-1">
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
            {userName}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/70' : 'text-gray-400'}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-900">{userName}</div>
            <div className="text-xs text-gray-500">{userRole}</div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleAccountSettings}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 text-sm">Account Settings</span>
            </button>

            <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 text-sm">Help & Support</span>
            </button>
          </div>

          <div className="border-t border-gray-100 my-1"></div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-red-600 text-sm font-medium">Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}