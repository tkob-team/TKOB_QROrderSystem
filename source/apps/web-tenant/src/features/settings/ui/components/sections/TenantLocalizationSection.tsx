'use client';

import React from 'react';
import { Card } from '@/shared/components';
import { Globe } from 'lucide-react';

export interface TenantLocalizationSectionProps {
  defaultLanguage: string;
  timezone: string;
  onDefaultLanguageChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

export function TenantLocalizationSection(props: TenantLocalizationSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
          <Globe className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Localization</h3>
          <p className="text-text-secondary text-sm">Language and timezone settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-primary">Default Language</label>
          <select
            value={props.defaultLanguage}
            onChange={(e) => props.onDefaultLanguageChange(e.target.value)}
            className="px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-primary">Timezone</label>
          <select
            value={props.timezone}
            onChange={(e) => props.onTimezoneChange(e.target.value)}
            className="px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern (EST/EDT)</option>
            <option value="CST">Central (CST/CDT)</option>
            <option value="PST">Pacific (PST/PDT)</option>
            <option value="GMT">GMT</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
