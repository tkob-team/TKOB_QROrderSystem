/**
 * Settings Feature - Mock Data
 * Initial state for both account and tenant settings
 */

import type { AccountSettingsState, TenantFullProfileState, DayKey } from '../../model/types';
import { DAYS } from '../../model/constants';

export const MOCK_ACCOUNT_SETTINGS_STATE: AccountSettingsState = {
  activeTab: 'profile',
  displayName: 'TKOB Admin',
  email: 'admin@tkqr.com',
  avatarInitials: 'TA',
  avatarColor: 'emerald',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  showCurrent: false,
  showNew: false,
  showConfirm: false,
  twoFactorEnabled: false,
  verificationCode: '',
};

export const MOCK_TENANT_PROFILE_STATE: TenantFullProfileState = {
  activeTab: 'profile',
  restaurantName: 'TKOB Restaurant',
  urlSlug: 'tkob-restaurant',
  address: '123 Main Street, Downtown',
  phone: '+84 90 123 4567',
  email: 'contact@tkqr.com',
  description: 'Modern tkob serving fresh, locally-sourced dishes.',
  defaultLanguage: 'en',
  theme: 'emerald',
  timezone: 'UTC+7 (Bangkok, Hanoi)',
  logoPreview: 'TK',
  coverUploaded: false,
  openingHours: {
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '22:00', closed: false },
    saturday: { open: '10:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false },
  },
  sourceDay: 'monday' as DayKey,
  stripeEnabled: true,
  paypalEnabled: false,
  cashEnabled: true,
  emailNotifications: true,
  orderNotifications: true,
  lowStockAlerts: true,
  staffNotifications: false,
  twoFactorEnabled: false,
  sessionTimeout: 30,
};
