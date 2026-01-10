'use client';

import React from 'react';
import { UserMenu } from '@/shared/components/UserMenu';

/**
 * Waiter TopBar
 * 
 * Simplified top navigation bar for waiter/service staff role.
 * Features:
 * - Restaurant name display
 * - User menu with role switching (dev mode)
 * - Account settings access
 * - Logout functionality
 * - Mobile-optimized for tablet use
 */

export interface WaiterTopBarProps {
  restaurantName?: string;
  userName?: string;
  userRole?: string;
  avatarColor?: string;
  onNavigate?: (screen: string) => void;
}

export function WaiterTopBar({ 
  restaurantName = 'TKOB Restaurant', 
  userName = 'Waiter',
  userRole = 'Waiter',
  avatarColor = 'blue',
  onNavigate
}: WaiterTopBarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
          {restaurantName}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <UserMenu 
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
