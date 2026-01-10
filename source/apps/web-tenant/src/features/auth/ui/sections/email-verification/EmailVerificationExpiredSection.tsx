/**
 * EmailVerificationExpiredSection - Presentational Component
 * Expired state UI for email verification
 */

import React from 'react';
import { XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card, CardContent } from '@/shared/components/Card';
import { AuthPageHeader } from '../../components/AuthPageHeader';

export interface EmailVerificationExpiredSectionProps {
  onResend: () => void;
  onBack: () => void;
}

export function EmailVerificationExpiredSection(props: EmailVerificationExpiredSectionProps) {
  const { onResend, onBack } = props;

  return (
    <div className="min-h-screen flex flex-col">
      <AuthPageHeader />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Code Expired</h2>
                <p className="text-gray-600">
                  This verification code has expired. Please request a new code.
                </p>
              </div>

              <div className="w-full space-y-3">
                <Button 
                  onClick={onResend}
                  className="w-full h-12 text-base font-semibold"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Resend Code
                </Button>
                <button
                  onClick={onBack}
                  className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
