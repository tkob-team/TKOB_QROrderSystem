import React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { DayKey, OpeningHoursDay } from './types';

interface RestaurantSetupSectionProps {
  openingHours: Record<DayKey, OpeningHoursDay>;
  sourceDay: DayKey;
  onSourceDayChange: (day: DayKey) => void;
  onApplyToAllDays: () => void;
  onToggleDay: (day: DayKey, enabled: boolean) => void;
  onTimeChange: (day: DayKey, payload: { openTime?: string; closeTime?: string }) => void;
  isTimeInvalid: (day: DayKey) => boolean;
}

const DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function RestaurantSetupSection({
  openingHours,
  sourceDay,
  onSourceDayChange,
  onApplyToAllDays,
  onToggleDay,
  onTimeChange,
  isTimeInvalid,
}: RestaurantSetupSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-emerald-800">Copy from:</span>
          <select
            value={sourceDay}
            onChange={(e) => onSourceDayChange(e.target.value as DayKey)}
            className="px-3 py-2 text-sm border border-emerald-300 rounded-lg bg-white \
              text-gray-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Button variant="secondary" onClick={onApplyToAllDays} className="text-sm">
          <Copy className="w-4 h-4 mr-2" />
          Apply to all
        </Button>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const hours = openingHours[day];
          const invalid = isTimeInvalid(day);

          return (
            <div key={day} className="space-y-1">
              <div
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                  invalid ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <label className="flex items-center gap-3 min-w-[130px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) => onToggleDay(day, e.target.checked)}
                    className="w-5 h-5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span
                    className={`text-sm font-medium capitalize ${hours.enabled ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    {day}
                  </span>
                </label>

                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={hours.openTime}
                    onChange={(e) => onTimeChange(day, { openTime: e.target.value })}
                    disabled={!hours.enabled}
                    className={`px-3 py-2 text-sm border rounded-lg transition-all
                      ${!hours.enabled 
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="time"
                    value={hours.closeTime}
                    onChange={(e) => onTimeChange(day, { closeTime: e.target.value })}
                    disabled={!hours.enabled}
                    className={`px-3 py-2 text-sm border rounded-lg transition-all
                      ${!hours.enabled 
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                  />
                </div>
              </div>

              {invalid && (
                <p className="text-xs text-red-600 ml-4">
                  {!hours.openTime || !hours.closeTime
                    ? 'Please set both opening and closing times.'
                    : 'Closing time must be later than opening time.'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        Enable the days your restaurant operates and set the hours for each day.
      </p>
    </div>
  );
}

export default RestaurantSetupSection;
