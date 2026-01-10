/**
 * Settings Mock Adapter
 * Simulates API calls with demo data and small delays
 */

import type { SettingsAdapter } from '../adapter.interface';
import { MOCK_ACCOUNT_SETTINGS_STATE, MOCK_TENANT_PROFILE_STATE } from './mock-settings.data';

export const mockSettingsAdapter: SettingsAdapter = {
  // Account settings queries
  async getAccountSettings() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...MOCK_ACCOUNT_SETTINGS_STATE };
  },

  // Account settings mutations
  async saveAccountProfile(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // In real app, would save to backend
    console.log('[Settings] Saved account profile:', payload);
  },

  async changePassword(payload) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    console.log('[Settings] Changed password');
  },

  async setAccount2FA(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('[Settings] 2FA toggled:', payload.enabled);
  },

  // Tenant profile queries
  async getTenantProfileSettings() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...MOCK_TENANT_PROFILE_STATE };
  },

  // Tenant profile mutations
  async saveTenantProfile(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('[Settings] Saved tenant profile:', payload);
  },

  async saveOpeningHours(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('[Settings] Saved opening hours');
  },

  async savePayments(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('[Settings] Saved payment methods:', payload);
  },

  async saveNotifications(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('[Settings] Saved notification preferences:', payload);
  },

  async saveTenantSecurity(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('[Settings] Saved security settings:', payload);
  },
};
