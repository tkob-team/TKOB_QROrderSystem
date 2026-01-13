/**
 * Settings Feature - Type Definitions (Pure Domain)
 * No React, lucide, or UI library imports
 */

// Account Settings Types
export type AccountSettingsTab = 'profile' | 'security';

export interface AccountProfileState {
  displayName: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface AccountSecurityState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrent: boolean;
  showNew: boolean;
  showConfirm: boolean;
  twoFactorEnabled: boolean;
  verificationCode: string;
}

export interface AccountSettingsState extends AccountProfileState, AccountSecurityState {
  activeTab: AccountSettingsTab;
}

// Tenant Profile Types
export type TenantProfileTab = 'profile' | 'hours' | 'payments' | 'notifications' | 'security';
export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface OpeningHoursDay {
  open: string;
  close: string;
  closed: boolean;
}

export interface TenantProfileState {
  activeTab: TenantProfileTab;
  restaurantName: string;
  urlSlug: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  defaultLanguage: string;
  theme: string;
  timezone: string;
  logoPreview: string;
  coverUploaded: boolean;
}

export interface TenantOpeningHoursState {
  openingHours: Record<DayKey, OpeningHoursDay>;
  sourceDay: DayKey;
}

export interface TenantPaymentsState {
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  cashEnabled: boolean;
}

export interface TenantNotificationsState {
  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  staffNotifications: boolean;
}

export interface TenantSecurityState {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}

export interface TenantFullProfileState
  extends TenantProfileState,
    TenantOpeningHoursState,
    TenantPaymentsState,
    TenantNotificationsState,
    TenantSecurityState {}

// Avatar configuration
export interface AvatarOption {
  color: string;
  bg: string;
  text: string;
  label: string;
}
