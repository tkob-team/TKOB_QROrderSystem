import { Metadata } from 'next';
import { RoleGuard } from '@/shared/guards';
import { MenuHubPage } from '@/features/menu';

export const metadata: Metadata = {
  title: 'Menu Management | TKOB Admin',
  description: 'Manage your restaurant menu items, categories, and modifiers',
};

export default function MenuPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <MenuHubPage />
    </RoleGuard>
  );
}
