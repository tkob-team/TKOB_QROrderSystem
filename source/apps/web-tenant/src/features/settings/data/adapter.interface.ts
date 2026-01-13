/**
 * Settings Data Adapter Interface
 * Defines the contract for fetching and saving settings
 */

import type { AccountSettingsState, TenantFullProfileState } from '../model/types';

export interface SettingsAdapter {
  // Account settings queries
  getAccountSettings(): Promise<AccountSettingsState>;
  
  // Account settings mutations
  saveAccountProfile(payload: { displayName: string; avatarColor: string }): Promise<void>;
  changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void>;
  setAccount2FA(payload: { enabled: boolean; verificationCode?: string }): Promise<void>;

  // Tenant profile queries
  getTenantProfileSettings(): Promise<TenantFullProfileState>;
  
  // Tenant profile mutations
  saveTenantProfile(payload: Partial<TenantFullProfileState>): Promise<void>;
  saveOpeningHours(payload: TenantFullProfileState['openingHours']): Promise<void>;
  savePayments(payload: { stripeEnabled: boolean; paypalEnabled: boolean; cashEnabled: boolean }): Promise<void>;
  saveNotifications(payload: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    staffNotifications: boolean;
  }): Promise<void>;
  saveTenantSecurity(payload: { twoFactorEnabled: boolean; sessionTimeout: number }): Promise<void>;
}

export type { SettingsAdapter as ISettingsAdapter };
