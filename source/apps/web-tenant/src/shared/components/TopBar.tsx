/**
 * TopBar Component - Smart Restaurant Design
 * GREEN background with restaurant name, nav links, and user menu
 * No search bar, no logo icon
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Menu as MenuIcon, Home, Info, HelpCircle } from 'lucide-react';
import { UserMenu } from './UserMenu';
import type { AdminScreenId } from './AdminShell';

export interface TopBarProps {
  restaurantName?: string;
  onNavigate?: (screen: AdminScreenId) => void;
  enableDevModeSwitch?: boolean;
  onMenuToggle?: () => void;
}

// Navigation links for header
const navLinks = [
  { id: 'home', label: 'Home', icon: Home, href: '/home' },
  { id: 'about', label: 'About', icon: Info, href: '/about' },
  { id: 'help', label: 'Help', icon: HelpCircle, href: '/help' },
];

export function TopBar({
  restaurantName = 'TKOB Restaurant',
  onNavigate,
  enableDevModeSwitch = false,
  onMenuToggle,
}: TopBarProps) {
  return (
    <header className="h-16 bg-emerald-600 text-white shadow-lg z-50 flex items-center px-4 md:px-6 shrink-0 relative">
      {/* Left Section: Mobile Menu + Restaurant Name */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-emerald-700 transition-colors"
          aria-label="Toggle menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Restaurant Name - Using display font, clickable to home */}
        <Link 
          href="/home" 
          className="text-2xl md:text-3xl tracking-tight hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'var(--font-rouge-script), cursive' }}
        >
          {restaurantName}
        </Link>
      </div>

      {/* Center Section: Navigation Links - Centered absolutely */}
      <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.id}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Section: Bell + User */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-emerald-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-emerald-600"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-white/20 mx-1"></div>

        {/* User Menu */}
        <UserMenu onNavigate={onNavigate} variant="dark" />
      </div>
    </header>
  );
}