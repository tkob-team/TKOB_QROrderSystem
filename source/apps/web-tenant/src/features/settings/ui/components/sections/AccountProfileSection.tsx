'use client';

import React from 'react';
import { Card, Input, Button } from '@/shared/components';
import { Building2 } from 'lucide-react';

export interface AccountProfileSectionProps {
  tenantName: string;
  email: string;
  isSaving: boolean;
  onTenantNameChange: (value: string) => void;
  onSave: () => void;
}

/**
 * Account Profile Section
 * Allows updating tenant/restaurant name via real API
 */
export function AccountProfileSection(props: AccountProfileSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Restaurant Profile</h3>
          <p className="text-text-secondary text-sm">Update your restaurant information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Restaurant Name"
          value={props.tenantName}
          onChange={(e) => props.onTenantNameChange(e.target.value)}
          placeholder="Your restaurant name"
          required
        />
        <Input
          label="Email"
          value={props.email}
          disabled
          helperText="Email is managed by your account"
        />
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
