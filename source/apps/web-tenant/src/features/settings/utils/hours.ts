/**
 * Opening hours utilities for tenant profile settings
 */

import { DAYS } from '../model/constants';
import type { DayKey, OpeningHoursDay } from '../model/types';

/**
 * Copies opening hours from source day to all other days
 */
export function copyHoursToAllDays(
  openingHours: Record<DayKey, OpeningHoursDay>,
  sourceDay: DayKey
): Record<DayKey, OpeningHoursDay> {
  const sourceHours = openingHours[sourceDay];
  const updated: Record<DayKey, OpeningHoursDay> = { ...openingHours };

  DAYS.forEach((day) => {
    updated[day] = { ...sourceHours };
  });

  return updated;
}

/**
 * Validates that all required days have hours set
 */
export function validateOpeningHours(openingHours: Record<DayKey, OpeningHoursDay>): { valid: boolean; error?: string } {
  for (const day of DAYS) {
    const hours = openingHours[day];
    if (!hours) {
      return { valid: false, error: `Hours not set for ${day}` };
    }
    if (!hours.closed) {
      if (!hours.open || !hours.close) {
        return { valid: false, error: `Invalid hours for ${day}` };
      }
      // Validate that close time is after open time (basic check)
      if (hours.close <= hours.open) {
        return { valid: false, error: `Close time must be after open time for ${day}` };
      }
    }
  }
  return { valid: true };
}

/**
 * Gets display label for opening hours
 */
export function formatOpeningHours(hours: OpeningHoursDay): string {
  if (hours.closed) {
    return 'Closed';
  }
  return `${hours.open} - ${hours.close}`;
}
