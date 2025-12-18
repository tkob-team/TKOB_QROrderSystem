'use client';

import { ReactNode, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminShell, type AdminNavItem, type AdminScreenId } from '@/shared/components/ui/AdminShell';
import { ROUTES } from '@/lib/routes';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active item based on current pathname
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

  // Handle navigation
  const handleNavigate = (screen: AdminScreenId) => {
    const routeMap: Record<AdminScreenId, string> = {
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
    if (route) {
      router.push(route);
    }
  };

  return (
    <AdminShell
      activeItem={activeItem}
      onNavigate={handleNavigate}
      restaurantName="TKOB Restaurant"
      enableDevModeSwitch={false}
    >
      {children}
    </AdminShell>
  );
}
