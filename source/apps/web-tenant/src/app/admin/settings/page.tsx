'use client';

import { RoleGuard } from '@/shared/guards';
import { TenantProfilePage } from '@/features/settings';

export default function TenantProfile() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <TenantProfilePage />
    </RoleGuard>
  );
}
