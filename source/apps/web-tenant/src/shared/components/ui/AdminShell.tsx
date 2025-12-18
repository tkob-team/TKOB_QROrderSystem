'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/shared/components/ui/Sidebar';
import { TopBar } from '@/shared/components/ui/TopBar';
import { ROUTES } from '@/lib/routes';

export type AdminScreenId =
  | 'dashboard'
  | 'menu'
  | 'menu-modifiers'
  | 'tables'
  | 'table-qr-detail'
  | 'orders'
  | 'analytics'
  | 'staff'
  | 'tenant-profile'
  | 'account-settings'
  // dùng cho devmode / logout / chuyển role
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
  | 'tenant-profile';

export interface AdminShellProps {
  /** Tên nhà hàng hiển thị ở TopBar (có thể bỏ qua) */
  restaurantName?: string;

  /** Nội dung riêng của từng màn (Dashboard, Menu, Orders, …) */
  children: React.ReactNode;

  /** 
   * Có cho phép dùng dev-mode switch role trong TopBar hay không
   * (nếu TopBar của bạn có props kiểu này; nếu không thì bỏ prop này đi)
   */
  enableDevModeSwitch?: boolean;
}

/**
 * AdminShell
 * 
 * Bọc toàn bộ layout Admin với auto-routing:
 * - Tự động detect active nav item từ pathname
 * - Tự động handle navigation với Next.js router
 * - Tự động disable scroll cho trang Menu Management
 * - Nền xám, Sidebar bên trái, TopBar phía trên, main content ở giữa
 */
export const AdminShell: React.FC<AdminShellProps> = ({
  restaurantName = 'TKOB Restaurant',
  enableDevModeSwitch = false,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // Auto-detect active nav item from pathname
  const activeItem: AdminNavItem = useMemo(() => {
    if (pathname.includes('/admin/dashboard')) return 'dashboard';
    if (pathname.includes('/admin/menu')) return 'menu';
    if (pathname.includes('/admin/tables')) return 'tables';
    if (pathname.includes('/admin/orders')) return 'orders';
    if (pathname.includes('/admin/analytics')) return 'analytics';
    if (pathname.includes('/admin/staff')) return 'staff';
    if (pathname.includes('/admin/tenant-profile')) return 'tenant-profile';
    if (pathname.includes('/admin/account-settings')) return 'tenant-profile';
    return 'dashboard';
  }, [pathname]);

  // Auto-disable scroll for pages that need custom scroll handling
  const disableContentScroll = useMemo(() => {
    return pathname.includes('/admin/menu');
  }, [pathname]);

  // Auto-handle navigation with Next.js router
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
      'tenant-profile': ROUTES.tenantProfile,
      'account-settings': ROUTES.accountSettings,
      login: ROUTES.login,
      kds: ROUTES.kds,
      'service-board': ROUTES.waiterServiceBoard,
    };

    const route = routeMap[screen];
    if (route && typeof route === 'string') {
      router.push(route);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - Fixed on desktop, hidden on mobile */}
      <Sidebar activeItem={activeItem} onNavigate={handleNavigate} />

      {/* Main area with fixed topbar and scrollable content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* TopBar - Fixed header */}
        <header className="shrink-0">
          <TopBar
            restaurantName={restaurantName}
            onNavigate={handleNavigate}
            enableDevModeSwitch={enableDevModeSwitch}
          />
        </header>

        {/* Content - Only this part scrolls */}
        <main className={`flex-1 bg-slate-50 ${disableContentScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {disableContentScroll ? (
            children
          ) : (
            <div className="px-8 py-6">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};