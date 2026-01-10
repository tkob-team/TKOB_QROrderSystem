'use client';

import React from 'react';
import { Card, Button, Switch } from '@/shared/components';
import { Shield } from 'lucide-react';

export interface TenantSecuritySectionProps {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  onTwoFactorChange: (enabled: boolean) => void;
  onSessionTimeoutChange: (value: number) => void;
  onSave: () => void;
}

export function TenantSecuritySection(props: TenantSecuritySectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Security Settings</h3>
          <p className="text-text-secondary text-sm">Control access to your account</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
          <div>
            <p className="font-semibold text-text-primary">Two-Factor Authentication</p>
            <p className="text-sm text-text-secondary">Require a code when signing in</p>
          </div>
          <Switch
            checked={props.twoFactorEnabled}
            onChange={props.onTwoFactorChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-primary">Session Timeout (minutes)</label>
          <input
            type="number"
            value={props.sessionTimeout}
            onChange={(e) => props.onSessionTimeoutChange(parseInt(e.target.value))}
            min="5"
            max="480"
            className="px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500"
          />
          <p className="text-sm text-text-secondary">
            Automatically log out after {props.sessionTimeout} minutes of inactivity
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
        <Button variant="secondary">Cancel</Button>
        <Button onClick={props.onSave}>Save Security</Button>
      </div>
    </Card>
  );
}
