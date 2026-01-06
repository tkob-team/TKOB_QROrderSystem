import { ReactNode } from 'react';
import { AdminShell } from '@/shared/components';

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin Layout
 * 
 * Wraps all /admin routes with AdminShell.
 * AdminShell now handles:
 * - Auto-detecting active nav item from pathname
 * - Auto-handling navigation with Next.js router
 * - Auto-disabling scroll for Menu Management page
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminShell restaurantName="TKOB Restaurant" enableDevModeSwitch={false}>
      {children}
    </AdminShell>
  );
}
