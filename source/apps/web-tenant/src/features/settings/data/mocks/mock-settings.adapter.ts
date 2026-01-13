/**
 * Settings Mock Adapter
 * Simulates API calls with demo data and small delays
 */

import type { SettingsAdapter } from '../adapter.interface';
import { logger } from '@/shared/utils/logger';
import { samplePayload } from '@/shared/utils/dataInspector';
import { MOCK_ACCOUNT_SETTINGS_STATE, MOCK_TENANT_PROFILE_STATE } from './mock-settings.data';

const logFullDataEnabled =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

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
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'settings',
        op: 'account.profile.save',
        payload: samplePayload(payload),
      });
    }
    // In real app, would save to backend
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'settings',
        op: 'account.profile.save',
        data: samplePayload({ success: true }),
      });
    }
  },

  async changePassword(payload) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'settings',
        op: 'account.password.change',
        payload: samplePayload({
          hasOldPassword: !!(payload as any).oldPassword,
          hasNewPassword: !!(payload as any).newPassword,
        }),
      });
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'settings',
        op: 'account.password.change',
        data: samplePayload({ success: true }),
      });
    }
  },

  async setAccount2FA(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'settings',
        op: 'account.2fa.set',
        payload: samplePayload(payload),
      });
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'settings',
        op: 'account.2fa.set',
        data: samplePayload({ success: true }),
      });
    }
  },

  // Tenant profile queries
  async getTenantProfileSettings() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...MOCK_TENANT_PROFILE_STATE };
  },

  // Tenant profile mutations
  async saveTenantProfile(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'settings',
        op: 'tenant.profile.save',
        payload: samplePayload(payload),
      });
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'settings',
        op: 'tenant.profile.save',
        data: samplePayload({ success: true }),
      });
    }
  },

  async saveOpeningHours(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'settings',
        op: 'tenant.hours.save',
        payload: samplePayload(payload),
      });
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'settings',
        op: 'tenant.hours.save',
        data: samplePayload({ success: true }),
      });
    }
  },

  async savePayments(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'settings',
        op: 'tenant.payments.save',
        payload: samplePayload(payload),
      });
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'settings',
        op: 'tenant.payments.save',
        data: samplePayload({ success: true }),
      });
    }
  },

  async saveNotifications(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'settings',
        op: 'tenant.notifications.save',
        payload: samplePayload(payload),
      });
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'settings',
        op: 'tenant.notifications.save',
        data: samplePayload({ success: true }),
      });
    }
  },

  async saveTenantSecurity(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'settings',
        op: 'tenant.security.save',
        payload: samplePayload(payload),
      });
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'settings',
        op: 'tenant.security.save',
        data: samplePayload({ success: true }),
      });
    }
  },
};
