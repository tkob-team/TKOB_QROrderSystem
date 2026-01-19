'use client';

import React, { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ROUTES } from '@/shared/config';
import { useAuth } from '@/shared/context/AuthContext';

export type AdminScreenId =
  | 'dashboard'
  | 'menu'
  | 'menu-modifiers'
  | 'tables'
  | 'table-qr-detail'
  | 'orders'
  | 'analytics'
  | 'staff'
  | 'settings'
  | 'profile'
  | 'login'
  | 'kds'
  | 'service-board';

export type AdminNavItem =
  | 'dashboard'
  | 'menu'
  | 'menu-modifiers'
  | 'tables'
  | 'orders'
  | 'kds'
  | 'service-board'
  | 'analytics'
  | 'staff'
  | 'tenant-profile'
  | 'account-settings';

export interface AdminShellProps {
  restaurantName?: string;
  children: React.ReactNode;
  enableDevModeSwitch?: boolean;
}

export function AdminShell({
  restaurantName,
  enableDevModeSwitch = false,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Use tenant name from auth context, fallback to prop or default
  const displayName = user?.tenant?.name || restaurantName || 'TKOB Restaurant';
  const userRole = user?.role === 'admin' ? 'Owner' : user?.role === 'kds' ? 'Kitchen' : 'Waiter';

  const activeItem: AdminNavItem = useMemo(() => {
    if (pathname.includes('/admin/dashboard')) return 'dashboard';
    if (pathname.includes('/admin/menu')) return 'menu';
    if (pathname.includes('/admin/tables')) return 'tables';
    if (pathname.includes('/admin/orders')) return 'orders';
    if (pathname.includes('/admin/kds')) return 'kds';
    if (pathname.includes('/admin/service-board')) return 'service-board';
    if (pathname.includes('/admin/analytics')) return 'analytics';
    if (pathname.includes('/admin/staff')) return 'staff';
    if (pathname.includes('/admin/settings')) return 'settings';
    if (pathname.includes('/admin/profile')) return 'profile';
    return 'dashboard';
  }, [pathname]);

  const handleNavigate = (screen: AdminScreenId) => {
    const routeMap: Record<AdminScreenId, string | ((id: string) => string)> = {
      dashboard: ROUTES.dashboard,
      menu: ROUTES.menu,
      'menu-modifiers': ROUTES.menuModifiers,
      tables: ROUTES.tables,
      'table-qr-detail': ROUTES.tableQRDetail,
      orders: ROUTES.orders,
      analytics: ROUTES.analytics,
      staff: ROUTES.staff,
      settings: ROUTES.settings,
      profile: ROUTES.profile,
      login: ROUTES.login,
      kds: ROUTES.kds,
      'service-board': ROUTES.waiterServiceBoard,
    };

    const route = routeMap[screen];
    if (route && typeof route === 'string') {
      router.push(route);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* TopBar - Fixed at top (not position:fixed, just at top of flex) */}
      <TopBar
        restaurantName={displayName}
        onNavigate={handleNavigate}
        enableDevModeSwitch={enableDevModeSwitch}
        onMenuToggle={handleToggleSidebar}
      />

      {/* Main Area: Sidebar + Content - fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - scrolls with content, not fixed */}
        <Sidebar 
          activeItem={activeItem} 
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          tenantName={displayName}
          userRole={userRole}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-xl
          transform transition-transform duration-300
          ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
        style={{ top: '64px' }}
      >
        <Sidebar 
          activeItem={activeItem} 
          onNavigate={(screen) => {
            handleNavigate(screen);
            setSidebarCollapsed(true);
          }}
          collapsed={false}
          onToggleCollapse={() => setSidebarCollapsed(true)}
          tenantName={displayName}
          userRole={userRole}
          isMobileView={true}
        />
      </aside>
    </div>
  );
}