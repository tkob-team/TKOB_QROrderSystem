import React from 'react';
import { useAppRouter } from '@/shared/hooks/useAppRouter';
import { ROUTES } from '@/shared/config';

interface MenuTabsProps {
  activeTab?: 'menu-items' | 'modifier-groups';
  onTabChange?: (tab: 'menu-items' | 'modifier-groups') => void;
}

export function MenuTabs({ activeTab = 'menu-items', onTabChange }: MenuTabsProps) {
  const { goTo } = useAppRouter();

  const handleTabChange = (tab: 'menu-items' | 'modifier-groups') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      // Fallback to navigation if no callback provided
      if (tab === 'modifier-groups') {
        goTo(ROUTES.menuModifiers);
      } else {
        goTo(ROUTES.menu);
      }
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-elevated rounded-lg">
      <button
        onClick={() => handleTabChange('menu-items')}
        className={`px-6 py-2.5 rounded-lg transition-all ${
          activeTab === 'menu-items'
            ? 'bg-primary text-accent-600 border border-accent-200 shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        style={{ fontSize: '14px', fontWeight: activeTab === 'menu-items' ? 600 : 500 }}
      >
        Menu Items
      </button>
      <button
        onClick={() => handleTabChange('modifier-groups')}
        className={`px-6 py-2.5 rounded-lg transition-all ${
          activeTab === 'modifier-groups'
            ? 'bg-primary text-accent-600 border border-accent-200 shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        style={{ fontSize: '14px', fontWeight: activeTab === 'modifier-groups' ? 600 : 500 }}
      >
        Modifier Groups
      </button>
    </div>
  );
}
