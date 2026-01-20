/**
 * Settings API Adapter
 * Real API integration for settings operations
 */

import type { SettingsAdapter } from '../adapter.interface';
import type { AccountSettingsState, TenantFullProfileState } from '../../model/types';
import { api } from '@/services/axios';
import { logger } from '@/shared/utils/logger';
import { mockSettingsAdapter } from '../mocks/mock-settings.adapter';

/**
 * Real API adapter for settings
 * Falls back to mock for operations not yet implemented on backend
 */
export const apiSettingsAdapter: SettingsAdapter = {
  // ==================== Account Settings ====================

  async getAccountSettings(): Promise<AccountSettingsState> {
    try {
      // Use /auth/me to get current user settings
      const response = await api.get('/api/v1/auth/me');
      const userData = response.data?.data || response.data;
      
      return {
        displayName: userData.user?.fullName || '',
        email: userData.user?.email || '',
        avatarColor: '#3B82F6', // Default color, could be stored in user preferences
        avatarInitials: (userData.user?.fullName || '').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false,
        twoFactorEnabled: false, // 2FA not implemented yet
        verificationCode: '',
        activeTab: 'profile',
      };
    } catch (error) {
      logger.warn('[api-settings] getAccountSettings failed, using mock', error);
      return mockSettingsAdapter.getAccountSettings();
    }
  },

  async saveAccountProfile(payload: { displayName: string; avatarColor: string }): Promise<void> {
    // Profile update not implemented yet - use mock
    logger.info('[api-settings] saveAccountProfile - using mock (API not implemented)');
    return mockSettingsAdapter.saveAccountProfile(payload);
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    logger.info('[api-settings] changePassword - calling real API');
    
    try {
      await api.post('/api/v1/auth/change-password', {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      });
      
      logger.info('[api-settings] changePassword - success');
    } catch (error: any) {
      logger.error('[api-settings] changePassword failed:', error?.response?.data || error.message);
      
      // Re-throw with a more descriptive error message
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to change password';
      
      throw new Error(errorMessage);
    }
  },

  async setAccount2FA(payload: { enabled: boolean; verificationCode?: string }): Promise<void> {
    // 2FA not implemented yet - use mock
    logger.info('[api-settings] setAccount2FA - using mock (API not implemented)');
    return mockSettingsAdapter.setAccount2FA(payload);
  },

  // ==================== Tenant Profile ====================

  async getTenantProfileSettings(): Promise<TenantFullProfileState> {
    try {
      // Get tenant details from /auth/me which includes tenant info
      const response = await api.get('/api/v1/auth/me');
      const data = response.data?.data || response.data;
      const tenant = data?.tenant;
      
      if (!tenant) {
        logger.warn('[api-settings] No tenant data in /auth/me response');
        return mockSettingsAdapter.getTenantProfileSettings();
      }
      
      // Parse settings JSON (stored as JSONB in database)
      const settings = typeof tenant.settings === 'string' 
        ? JSON.parse(tenant.settings) 
        : tenant.settings || {};
      
      // Map API response to TenantFullProfileState
      return {
        activeTab: 'hours',
        restaurantName: tenant.name || '',
        urlSlug: tenant.slug || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        description: settings.description || '',
        defaultLanguage: settings.language || 'en',
        theme: settings.theme || 'emerald',
        timezone: settings.timezone || 'UTC+7 (Bangkok, Hanoi)',
        logoPreview: tenant.name?.substring(0, 2).toUpperCase() || 'TK',
        coverUploaded: false,
        openingHours: settings.openingHours || {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '22:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '21:00', closed: false },
        },
        sourceDay: 'monday',
        stripeEnabled: false,
        paypalEnabled: false,
        cashEnabled: true,
        emailNotifications: true,
        orderNotifications: true,
        lowStockAlerts: true,
        staffNotifications: false,
        twoFactorEnabled: false,
        sessionTimeout: 30,
      };
    } catch (error) {
      logger.warn('[api-settings] getTenantProfileSettings failed, using mock', error);
      return mockSettingsAdapter.getTenantProfileSettings();
    }
  },

  async saveTenantProfile(payload: Partial<TenantFullProfileState>): Promise<void> {
    logger.info('[api-settings] saveTenantProfile - calling real API');
    
    try {
      // Map frontend state to backend UpdateProfileDto
      const updatePayload: {
        name?: string;
        description?: string;
        phone?: string;
        address?: string;
        logoUrl?: string;
      } = {};
      
      if (payload.restaurantName !== undefined) {
        updatePayload.name = payload.restaurantName;
      }
      // Note: slug is auto-generated from name on backend, don't send it
      if (payload.description !== undefined) {
        updatePayload.description = payload.description;
      }
      if (payload.phone !== undefined) {
        updatePayload.phone = payload.phone;
      }
      if (payload.address !== undefined) {
        updatePayload.address = payload.address;
      }
      
      await api.patch('/api/v1/tenants/profile', updatePayload);
      logger.info('[api-settings] saveTenantProfile - success');
    } catch (error: any) {
      logger.error('[api-settings] saveTenantProfile failed:', error?.response?.data || error.message);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to save profile';
      throw new Error(errorMessage);
    }
  },

  async saveOpeningHours(payload: TenantFullProfileState['openingHours']): Promise<void> {
    logger.info('[api-settings] saveOpeningHours - calling real API');
    
    try {
      await api.patch('/api/v1/tenants/opening-hours', payload);
      logger.info('[api-settings] saveOpeningHours - success');
    } catch (error: any) {
      logger.error('[api-settings] saveOpeningHours failed:', error?.response?.data || error.message);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        'Failed to save opening hours';
      throw new Error(errorMessage);
    }
  },

  async savePayments(payload: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    cashEnabled: boolean;
  }): Promise<void> {
    logger.info('[api-settings] savePayments - using mock (API not implemented)');
    return mockSettingsAdapter.savePayments(payload);
  },

  async saveNotifications(payload: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    staffNotifications: boolean;
  }): Promise<void> {
    logger.info('[api-settings] saveNotifications - using mock (API not implemented)');
    return mockSettingsAdapter.saveNotifications(payload);
  },

  async saveTenantSecurity(payload: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  }): Promise<void> {
    logger.info('[api-settings] saveTenantSecurity - using mock (API not implemented)');
    return mockSettingsAdapter.saveTenantSecurity(payload);
  },
};
