import { RoleGuard } from '@/shared/guards';
import { AccountSettingsPage } from '@/features/settings';

export default function AccountSettings() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AccountSettingsPage />
    </RoleGuard>
  );
}
