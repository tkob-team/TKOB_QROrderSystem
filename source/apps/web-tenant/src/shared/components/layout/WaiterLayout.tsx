'use client';

import React from 'react';
import { WaiterTopBar } from '@/shared/components/ui/WaiterTopBar';

/**
 * Waiter Layout
 * 
 * Layout wrapper for waiter/service staff screens.
 * Features:
 * - WaiterTopBar for navigation
 * - Conditional topbar (hidden for account settings)
 * - Full-height layout for mobile/tablet use
 * - Clean, simple interface optimized for service tasks
 */

interface WaiterLayoutProps {
  children: React.ReactNode;
  currentScreen?: string;
  hideTopBar?: boolean;
  restaurantName?: string;
  userName?: string;
  userRole?: string;
  avatarColor?: string;
  onNavigate?: (screen: string) => void;
}

export function WaiterLayout({ 
  children, 
  currentScreen,
  hideTopBar,
  restaurantName = 'TKOB Restaurant',
  userName = 'Waiter',
  userRole = 'Waiter',
  avatarColor = 'blue',
  onNavigate
}: WaiterLayoutProps) {
  // Hide topbar for account-settings (it has its own header)
  const showTopBar = !hideTopBar && currentScreen !== 'account-settings';

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {showTopBar && (
        <WaiterTopBar 
          restaurantName={restaurantName}
          userName={userName}
          userRole={userRole}
          avatarColor={avatarColor}
          onNavigate={onNavigate}
        />
      )}
      
      <div className="flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
