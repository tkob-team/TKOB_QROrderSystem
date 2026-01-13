'use client';

import React from 'react';
import { Card, Input, Button } from '@/shared/components';
import { Smartphone, Lock } from 'lucide-react';

export interface Account2FASectionProps {
  verificationCode: string;
  twoFactorEnabled: boolean;
  isVerifying: boolean;
  onVerificationCodeChange: (value: string) => void;
  onEnable: () => void;
}

export function Account2FASection(props: Account2FASectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Two-Factor Authentication</h3>
          <p className="text-text-secondary text-sm">Add an extra layer of security to your account</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-text-primary">Verification Code</label>
        <Input
          value={props.verificationCode}
          onChange={(e) => props.onVerificationCodeChange(e.target.value)}
          placeholder="Enter 6-digit code"
          maxLength={6}
        />
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Lock className="w-4 h-4" />
          Codes are simulated for demo purposes.
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
        <Button variant="secondary">Maybe later</Button>
        <Button onClick={props.onEnable} disabled={props.isVerifying}>
          {props.twoFactorEnabled ? 'Disable 2FA' : props.isVerifying ? 'Verifying…' : 'Enable 2FA'}
        </Button>
      </div>
    </Card>
  );
}
