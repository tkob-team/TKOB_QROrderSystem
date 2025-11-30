import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { QrCode, Mail, CheckCircle, XCircle } from 'lucide-react';
import "../../styles/globals.css";

interface EmailVerificationProps {
  onNavigate?: (screen: string) => void;
}

export function EmailVerification({ onNavigate }: EmailVerificationProps) {
  const [state, setState] = useState<'check' | 'verified' | 'expired'>('check');

  const renderContent = () => {
    switch (state) {
      case 'check':
        return (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Check your email</h2>
              <p className="text-gray-600 text-center">
                We've sent a verification link to your email address. Please click the link to verify your account.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Button variant="secondary" className="w-full">
                Resend verification email
              </Button>
              <div className="flex gap-2 items-center justify-center">
                <Button variant="tertiary" onClick={() => setState('verified')}>
                  Simulate verified
                </Button>
                <Button variant="tertiary" onClick={() => setState('expired')}>
                  Simulate expired
                </Button>
              </div>
            </div>
          </>
        );

      case 'verified':
        return (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Email verified!</h2>
              <p className="text-gray-600 text-center">
                Your email has been successfully verified. You can now access your dashboard.
              </p>
            </div>
            <Button onClick={() => onNavigate?.('onboarding')} className="w-full">
              Go to dashboard
            </Button>
          </>
        );

      case 'expired':
        return (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Link expired</h2>
              <p className="text-gray-600 text-center">
                This verification link has expired or is invalid. Please request a new verification email.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Button className="w-full">
                Resend link
              </Button>
              <Button variant="tertiary" onClick={() => setState('check')} className="w-full">
                Back
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-gray-900" style={{ fontSize: '20px' }}>TKQR</span>
        </div>
      </div>

      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center gap-8">
          {renderContent()}
        </div>
      </Card>
    </div>
  );
}

export default EmailVerification;
