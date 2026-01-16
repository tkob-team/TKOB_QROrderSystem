import { Suspense } from 'react';
import { StaffInvitationSignup } from '@/features/auth/ui/pages/StaffInvitationSignupPage';

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <StaffInvitationSignup />
    </Suspense>
  );
}
