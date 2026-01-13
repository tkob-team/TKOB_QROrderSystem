/**
 * StaffInvitationExpiredSection - Presentational Component
 * Expired state UI for staff invitation
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card, CardContent } from '@/shared/components/Card';
import { AuthPageHeader } from '../../components/AuthPageHeader';

export interface StaffInvitationExpiredSectionProps {
  onNavigateLogin: () => void;
}

export function StaffInvitationExpiredSection(props: StaffInvitationExpiredSectionProps) {
  const { onNavigateLogin } = props;

  return (
    <div className="min-h-screen flex flex-col">
      <AuthPageHeader />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Invitation Expired</h2>
                <p className="text-gray-600">
                  This invitation link has expired or is no longer valid. Please contact your administrator for a new invitation.
                </p>
              </div>

              <Button 
                onClick={onNavigateLogin}
                className="w-full h-12 text-base font-semibold"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
