'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MenuManagementPage } from './MenuManagementPage';
import { MenuModifiersPage } from './MenuModifiersPage';

type TabId = 'items' | 'modifiers';

const TABS = [
  { id: 'items' as TabId, label: 'Menu Items' },
  { id: 'modifiers' as TabId, label: 'Modifiers' },
] as const;

export function MenuHubPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || 'items');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'items':
        return <MenuManagementPage />;
      case 'modifiers':
        return <MenuModifiersPage showHeader={false} />;
      default:
        return <MenuManagementPage />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Tabs inline */}
      <div className="border-b border-gray-200 bg-white px-4 md:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Title */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-sm text-gray-600 mt-0.5 hidden md:block">
              Manage your restaurant menu items and modifiers
            </p>
          </div>

          {/* Tabs - pill style */}
          <nav className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg" aria-label="Menu tabs">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-white text-emerald-600 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
}
