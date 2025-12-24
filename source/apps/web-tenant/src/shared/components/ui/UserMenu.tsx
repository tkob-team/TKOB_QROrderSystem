'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut, Code } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { config } from '@/lib/config';
import type { UserRole } from '@/shared/context/AuthContext';

import type { AdminScreenId } from './AdminShell';

interface UserMenuProps {
  userName?: string;
  userRole?: string;
  avatarColor?: string;
  onNavigate?: (screen: AdminScreenId) => void;
}

export function UserMenu({ 
  userName = 'Admin User', 
  userRole = 'Admin',
  avatarColor = 'emerald',
  onNavigate 
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const getAvatarColors = () => {
    switch (avatarColor) {
      case 'emerald':
        return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
      case 'amber':
        return { bg: 'bg-amber-100', text: 'text-amber-600' };
      case 'orange':
        return { bg: 'bg-orange-100', text: 'text-orange-600' };
      case 'blue':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'purple':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'rose':
        return { bg: 'bg-rose-100', text: 'text-rose-600' };
      case 'teal':
        return { bg: 'bg-teal-100', text: 'text-teal-600' };
      case 'indigo':
        return { bg: 'bg-indigo-100', text: 'text-indigo-600' };
      default:
        return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
    }
  };

  const avatarColors = getAvatarColors();

  const { logout } = useAuth();

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
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-xl transition-colors py-2 pr-2"
      >
        <div className={`w-10 h-10 ${avatarColors.bg} rounded-full flex items-center justify-center shrink-0`}>
          <span className={avatarColors.text} style={{ fontSize: '15px', fontWeight: 600 }}>
            {userName.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>{userName}</span>
          <span className="text-gray-600" style={{ fontSize: '13px' }}>{userRole}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50">
          <button
            onClick={handleAccountSettings}
            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
              Account settings
            </span>
          </button>

          {/* Separator */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* Log out */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 group"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span className="text-red-600 group-hover:text-red-700" style={{ fontSize: '14px', fontWeight: 500 }}>
              Log out
            </span>
          </button>
        </div>
      )}
    </div>
  );
}