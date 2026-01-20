/**
 * Settings Data Adapter Interface
 * Defines the contract for fetching and saving settings
 */

import type { AccountSettingsState, TenantFullProfileState } from '../model/types';
import type {
  PublicSubscriptionControllerGetPublicPlans200Item,
  PublicSubscriptionControllerGetFeatureComparison200,
  PaymentStatusResponseDto,
} from '@/services/generated/models';

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

/**
 * Subscription operations
 */
export interface ISubscriptionAdapter {
  getPublicPlans(): Promise<PublicSubscriptionControllerGetPublicPlans200Item[]>;
  getFeatureComparison(): Promise<PublicSubscriptionControllerGetFeatureComparison200>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCurrentSubscription(): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getUsage(): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upgradePlan(data: any): Promise<any>;
}

/**
 * Payment verification operations
 */
export interface IPaymentAdapter {
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto>;
  checkPayment(paymentId: string): Promise<{ confirmed: boolean; status: string }>;
}

export type { SettingsAdapter as ISettingsAdapter };
