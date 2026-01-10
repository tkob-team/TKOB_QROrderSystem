'use client';

import React from 'react';
import { Card, Button } from '@/shared/components';
import { Clock, Copy } from 'lucide-react';
import { DAYS, DAY_LABELS } from '../../../model';
import type { DayKey } from '../../../model/types';

export interface TenantOpeningHoursSectionProps {
  openingHours: Record<DayKey, { open: string; close: string; closed: boolean }>;
  sourceDay: DayKey;
  onSourceDayChange: (day: DayKey) => void;
  onHoursChange: (hours: Record<DayKey, { open: string; close: string; closed: boolean }>) => void;
  onCopyToAll: () => void;
  onSave: () => void;
}

export function TenantOpeningHoursSection(props: TenantOpeningHoursSectionProps) {
  const timeSlots = React.useMemo(
    () => Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    []
  );

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-text-primary font-semibold">Opening Hours</h3>
            <select
              value={props.sourceDay}
              onChange={(e) => props.onSourceDayChange(e.target.value as DayKey)}
              className="text-sm px-2 py-1 border border-default rounded"
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {DAY_LABELS[day]}
                </option>
              ))}
            </select>
          </div>
          <p className="text-text-secondary text-sm">Set your restaurant&apos;s business hours</p>
        </div>
        <button
          onClick={props.onCopyToAll}
          className="px-3 py-2 bg-accent-50 text-accent-600 rounded-lg text-sm font-semibold hover:bg-accent-100 transition-colors flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy to All
        </button>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-3 p-4 bg-elevated rounded-lg border border-default">
            <div className="w-28 font-semibold text-text-primary">{DAY_LABELS[day]}</div>
            <div className="flex items-center gap-2">
              <select
                value={props.openingHours[day]?.open || '09:00'}
                onChange={(e) =>
                  props.onHoursChange({
                    ...props.openingHours,
                    [day]: { ...props.openingHours[day], open: e.target.value },
                  })
                }
                className="px-3 py-2 border border-default rounded text-sm"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <span className="text-text-secondary">to</span>
              <select
                value={props.openingHours[day]?.close || '22:00'}
                onChange={(e) =>
                  props.onHoursChange({
                    ...props.openingHours,
                    [day]: { ...props.openingHours[day], close: e.target.value },
                  })
                }
                className="px-3 py-2 border border-default rounded text-sm"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <label className="ml-auto flex items-center gap-2">
              <input
                type="checkbox"
                checked={props.openingHours[day]?.closed || false}
                onChange={(e) =>
                  props.onHoursChange({
                    ...props.openingHours,
                    [day]: { ...props.openingHours[day], closed: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded border-default cursor-pointer"
              />
              <span className="text-sm text-text-secondary">Closed</span>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
        <Button variant="secondary">Cancel</Button>
        <Button onClick={props.onSave}>Save Hours</Button>
      </div>
    </Card>
  );
}
