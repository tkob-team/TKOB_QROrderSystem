/**
 * Settings Feature - Domain Constants (Pure Domain)
 * No React, lucide, or UI library imports
 */

import type { DayKey } from './types';

// Day keys and labels
export const DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

// Validation thresholds
export const PASSWORD_MIN_LENGTH = 8;

// Demo mode notice
export const DEMO_MODE_NOTICE = 'This is simulated in demo mode';
