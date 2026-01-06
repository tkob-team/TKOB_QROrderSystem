'use client';

import React from 'react';
import { MenuTabs } from '@/features/menu-management/components/MenuTabs';

type ModifiersHeaderProps = {
  onTabChange: (tab: string) => void;
};

export function ModifiersHeader({ onTabChange }: ModifiersHeaderProps) {
  return (
    <div className="px-6 pt-3 pb-2 border-b border-gray-200 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2
            className="text-gray-900"
            style={{
              fontSize: '26px',
              fontWeight: 700,
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}
          >
            Modifier Groups
          </h2>
          <p className="text-gray-600" style={{ fontSize: '14px' }}>
            Manage sizes, toppings, and other options for menu items
          </p>
        </div>

        <MenuTabs
          activeTab="modifier-groups"
          onTabChange={onTabChange}
        />
      </div>
    </div>
  );
}
