'use client';

import React from 'react';
import { Card } from '@/shared/components';
import { Palette } from 'lucide-react';

export interface TenantAppearanceSectionProps {
  theme: string;
  onThemeChange: (value: string) => void;
}

export function TenantAppearanceSection(props: TenantAppearanceSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
          <Palette className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Appearance</h3>
          <p className="text-text-secondary text-sm">Customize your restaurant&apos;s look</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-text-primary">Theme</label>
        <select
          value={props.theme}
          onChange={(e) => props.onThemeChange(e.target.value)}
          className="px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
    </Card>
  );
}
