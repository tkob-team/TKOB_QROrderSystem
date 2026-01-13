/**
 * ResetPasswordSuccessSection - Presentational Component
 * Success state UI for password reset
 */

import React, { RefObject } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card, CardContent } from '@/shared/components/Card';
import { AuthPageHeader } from '../../components/AuthPageHeader';

export interface ResetPasswordSuccessSectionProps {
  successRef: RefObject<HTMLDivElement>;
  onNavigateLogin: () => void;
}

export function ResetPasswordSuccessSection(props: ResetPasswordSuccessSectionProps) {
  const { successRef, onNavigateLogin } = props;

  return (
    <div className="min-h-screen flex flex-col">
      <AuthPageHeader />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div ref={successRef} className="flex flex-col items-center gap-6 text-center opacity-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Password Reset!</h2>
                <p className="text-gray-600">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </div>

              <Button 
                onClick={onNavigateLogin}
                className="w-full h-12 text-base font-semibold"
              >
                Continue to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
