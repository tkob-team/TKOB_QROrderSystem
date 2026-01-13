import type { LucideIcon } from 'lucide-react';

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type OpeningHoursDay = {
  enabled: boolean;
  openTime: string;
  closeTime: string;
};

export interface OnboardingStep {
  number: number;
  label: string;
  icon: LucideIcon;
}

export interface FormData {
  name: string;
  slug: string;
  description: string;
  phone: string;
  address: string;
  logoUrl: string;
  language: string;
  theme: string;
  openingHours: Record<DayKey, OpeningHoursDay>;
}
