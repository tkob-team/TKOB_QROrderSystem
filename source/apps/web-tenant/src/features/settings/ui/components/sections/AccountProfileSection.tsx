'use client';

import React from 'react';
import { Card, Input, Button } from '@/shared/components';
import { User as UserIcon } from 'lucide-react';

export interface AccountProfileSectionProps {
  displayName: string;
  email: string;
  avatarColor: string;
  avatarInitials: string;
  isSaving: boolean;
  onDisplayNameChange: (value: string) => void;
  onAvatarColorChange: (color: string) => void;
  onSave: () => void;
}

const avatarPalette = [
  { color: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Emerald' },
  { color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600', label: 'Blue' },
  { color: 'amber', bg: 'bg-amber-100', text: 'text-amber-600', label: 'Amber' },
  { color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-600', label: 'Indigo' },
  { color: 'rose', bg: 'bg-rose-100', text: 'text-rose-600', label: 'Rose' },
  { color: 'teal', bg: 'bg-teal-100', text: 'text-teal-600', label: 'Teal' },
];

export function AccountProfileSection(props: AccountProfileSectionProps) {
  const currentAvatar = React.useMemo(
    () => avatarPalette.find((a) => a.color === props.avatarColor) || avatarPalette[0],
    [props.avatarColor]
  );

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-elevated rounded-lg flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-text-secondary" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Profile</h3>
          <p className="text-text-secondary text-sm">Update your personal information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Display Name"
          value={props.displayName}
          onChange={(e) => props.onDisplayNameChange(e.target.value)}
          placeholder="Your name"
          required
        />
        <Input
          label="Email"
          value={props.email}
          disabled
          helperText="Email is managed by your provider"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <label className="text-text-primary text-sm font-semibold">Avatar</label>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 ${currentAvatar.bg} rounded-full flex items-center justify-center`}>
            <span className={`${currentAvatar.text} text-base font-bold`}>
              {props.avatarInitials}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {avatarPalette.map((avatar) => (
              <button
                key={avatar.color}
                onClick={() => props.onAvatarColorChange(avatar.color)}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  props.avatarColor === avatar.color
                    ? 'border-accent-500 bg-accent-50 text-accent-600'
                    : 'border-default text-text-secondary hover:border-accent-300'
                }`}
              >
                {avatar.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-default">
        <Button variant="secondary" disabled={props.isSaving}>Cancel</Button>
        <Button onClick={props.onSave} disabled={props.isSaving}>
          {props.isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}
