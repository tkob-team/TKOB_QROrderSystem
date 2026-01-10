'use client';

import React from 'react';
import { Card, Button } from '@/shared/components';
import { Shield, Eye, EyeOff } from 'lucide-react';

export interface AccountPasswordSectionProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrent: boolean;
  showNew: boolean;
  showConfirm: boolean;
  isSaving: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onShowCurrentToggle: () => void;
  onShowNewToggle: () => void;
  onShowConfirmToggle: () => void;
  onSave: () => void;
}

export function AccountPasswordSection(props: AccountPasswordSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Change Password</h3>
          <p className="text-text-secondary text-sm">Keep your account secure with a strong password</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-primary">Current Password</label>
          <div className="relative">
            <input
              type={props.showCurrent ? 'text' : 'password'}
              value={props.currentPassword}
              onChange={(e) => props.onCurrentPasswordChange(e.target.value)}
              className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={props.onShowCurrentToggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            >
              {props.showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-primary">New Password</label>
          <div className="relative">
            <input
              type={props.showNew ? 'text' : 'password'}
              value={props.newPassword}
              onChange={(e) => props.onNewPasswordChange(e.target.value)}
              className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={props.onShowNewToggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            >
              {props.showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-primary">Confirm New Password</label>
          <div className="relative">
            <input
              type={props.showConfirm ? 'text' : 'password'}
              value={props.confirmPassword}
              onChange={(e) => props.onConfirmPasswordChange(e.target.value)}
              className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
              placeholder="Re-enter new password"
            />
            <button
              type="button"
              onClick={props.onShowConfirmToggle}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            >
              {props.showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
        <Button variant="secondary" disabled={props.isSaving}>Cancel</Button>
        <Button onClick={props.onSave} disabled={props.isSaving}>
          {props.isSaving ? 'Saving…' : 'Update Password'}
        </Button>
      </div>
    </Card>
  );
}
