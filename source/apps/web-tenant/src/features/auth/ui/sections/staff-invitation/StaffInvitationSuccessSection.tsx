/**
 * StaffInvitationSuccessSection - Presentational Component
 * Success state UI for staff invitation acceptance
 */

import React, { RefObject } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card, CardContent } from '@/shared/components/Card';
import { AuthPageHeader } from '../../components/AuthPageHeader';
import type { InvitationDetails } from './types';

export interface StaffInvitationSuccessSectionProps {
  successRef: RefObject<HTMLDivElement>;
  invitationDetails: InvitationDetails;
  onNavigateDashboard: () => void;
}

export function StaffInvitationSuccessSection(props: StaffInvitationSuccessSectionProps) {
  const { successRef, invitationDetails, onNavigateDashboard } = props;

  return (
    <div className="min-h-screen flex flex-col">
      <AuthPageHeader showBackButton={false} />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div ref={successRef} className="flex flex-col items-center gap-6 text-center opacity-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-gray-900">
                  Welcome to the Team!
                </h2>
                <p className="text-gray-600">
                  Your account has been created. You&apos;re now part of <span className="font-semibold text-emerald-600">{invitationDetails.restaurantName}</span>.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg w-full">
                <p className="text-sm text-emerald-700">
                  <span className="font-semibold">Your role:</span> {invitationDetails.role}
                </p>
              </div>

              <Button 
                onClick={onNavigateDashboard}
                className="w-full h-12 text-base font-semibold"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
