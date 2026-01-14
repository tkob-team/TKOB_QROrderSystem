/**
 * useTenantProfileController - Public Controller Hook
 * Orchestrates all tenant profile state, handlers, and queries
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTenantProfileSettings } from './queries/useTenantProfileSettings';
import { settingsAdapter } from '../data/factory';
import { logger } from '@/shared/utils/logger';
import { buildSlugPreview, copyHoursToAllDays, validateRestaurantName } from '../utils';
import { samplePayload } from '@/shared/utils/dataInspector';
import type { TenantProfileTab, DayKey, TenantFullProfileState } from '../model/types';

const DEFAULT_STATE: TenantFullProfileState = {
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
  sourceDay: 'monday',
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

export function useTenantProfileController() {
  const { state: queriedState } = useTenantProfileSettings();

  const useLogging = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';
  const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';
  const logFullDataEnabled =
    process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
    process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

  // Initialize from query or defaults
  const initialState = queriedState || DEFAULT_STATE;

  const viewModelLoggedRef = useRef(false);

  // Profile state
  const [activeTab, setActiveTab] = useState<TenantProfileTab>(initialState.activeTab);
  const [restaurantName, setRestaurantName] = useState(initialState.restaurantName);
  const [urlSlug, setUrlSlug] = useState(initialState.urlSlug);
  const [address, setAddress] = useState(initialState.address);
  const [phone, setPhone] = useState(initialState.phone);
  const [email, setEmail] = useState(initialState.email);
  const [description, setDescription] = useState(initialState.description);
  const [defaultLanguage, setDefaultLanguage] = useState(initialState.defaultLanguage);
  const [theme, setTheme] = useState(initialState.theme);
  const [timezone, setTimezone] = useState(initialState.timezone);
  const [logoPreview, setLogoPreview] = useState(initialState.logoPreview);
  const [coverUploaded, setCoverUploaded] = useState(initialState.coverUploaded);

  // Opening hours
  const [openingHours, setOpeningHours] = useState(initialState.openingHours);
  const [sourceDay, setSourceDay] = useState<DayKey>(initialState.sourceDay);

  // Payments
  const [stripeEnabled, setStripeEnabled] = useState(initialState.stripeEnabled);
  const [paypalEnabled, setPaypalEnabled] = useState(initialState.paypalEnabled);
  const [cashEnabled, setCashEnabled] = useState(initialState.cashEnabled);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(initialState.emailNotifications);
  const [orderNotifications, setOrderNotifications] = useState(initialState.orderNotifications);
  const [lowStockAlerts, setLowStockAlerts] = useState(initialState.lowStockAlerts);
  const [staffNotifications, setStaffNotifications] = useState(initialState.staffNotifications);

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialState.twoFactorEnabled);
  const [sessionTimeout, setSessionTimeout] = useState(initialState.sessionTimeout);

  const slugPreview = useMemo(
    () => buildSlugPreview(urlSlug),
    [urlSlug]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSaveProfile = useCallback(async () => {
    const validation = validateRestaurantName(restaurantName);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }
    if (useLogging) {
      logger.info('[ui] FORM_SUBMIT_ATTEMPT', {
        feature: 'settings',
        section: 'tenant-profile',
        payloadKeys: logDataEnabled
          ? ['restaurantName', 'urlSlug', 'address', 'phone', 'email', 'description', 'defaultLanguage', 'theme', 'timezone']
          : undefined,
        sample: logFullDataEnabled
          ? samplePayload({ restaurantName, urlSlug, address, phone, email, description, defaultLanguage, theme, timezone })
          : undefined,
      });
    }
    logger.info('[settings] SAVE_PROFILE_ATTEMPT');
    try {
      await settingsAdapter.saveTenantProfile({
        restaurantName,
        urlSlug,
        address,
        phone,
        email,
        description,
        defaultLanguage,
        theme,
        timezone,
        logoPreview,
        coverUploaded,
      });
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_SUCCESS', {
          feature: 'settings',
          section: 'tenant-profile',
          payloadKeys: logDataEnabled
            ? ['restaurantName', 'urlSlug', 'address', 'phone', 'email', 'description', 'defaultLanguage', 'theme', 'timezone']
            : undefined,
        });
      }
      logger.info('[settings] SAVE_PROFILE_SUCCESS');
      toast.success('Profile saved');
    } catch (error) {
      toast.error('Failed to save profile');
      logger.error('[settings] SAVE_PROFILE_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [restaurantName, urlSlug, address, phone, email, description, defaultLanguage, theme, timezone, logoPreview, coverUploaded]);

  const handleCopyHoursToAll = useCallback(() => {
    const updatedHours = copyHoursToAllDays(openingHours, sourceDay);
    setOpeningHours(updatedHours);
    toast.success('Copied hours to all days');
  }, [openingHours, sourceDay]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSaveHours = useCallback(async () => {
    if (useLogging) {
      logger.info('[ui] FORM_SUBMIT_ATTEMPT', {
        feature: 'settings',
        section: 'opening-hours',
        payloadKeys: logDataEnabled ? ['openingHours'] : undefined,
        sample: logFullDataEnabled ? samplePayload(openingHours) : undefined,
      });
    }
    logger.info('[settings] SAVE_HOURS_ATTEMPT');
    try {
      await settingsAdapter.saveOpeningHours(openingHours);
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_SUCCESS', {
          feature: 'settings',
          section: 'opening-hours',
          payloadKeys: logDataEnabled ? ['openingHours'] : undefined,
        });
      }
      logger.info('[settings] SAVE_HOURS_SUCCESS');
      toast.success('Opening hours saved');
    } catch (error) {
      toast.error('Failed to save opening hours');
      logger.error('[settings] SAVE_HOURS_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [openingHours]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSavePayments = useCallback(async () => {
    if (useLogging) {
      logger.info('[ui] FORM_SUBMIT_ATTEMPT', {
        feature: 'settings',
        section: 'payments',
        payloadKeys: logDataEnabled ? ['stripeEnabled', 'paypalEnabled', 'cashEnabled'] : undefined,
        sample: logFullDataEnabled ? samplePayload({ stripeEnabled, paypalEnabled, cashEnabled }) : undefined,
      });
    }
    logger.info('[settings] SAVE_PAYMENTS_ATTEMPT', { stripeEnabled, paypalEnabled, cashEnabled });
    try {
      await settingsAdapter.savePayments({ stripeEnabled, paypalEnabled, cashEnabled });
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_SUCCESS', {
          feature: 'settings',
          section: 'payments',
          payloadKeys: logDataEnabled ? ['stripeEnabled', 'paypalEnabled', 'cashEnabled'] : undefined,
        });
      }
      logger.info('[settings] SAVE_PAYMENTS_SUCCESS');
      toast.success('Payment settings saved');
    } catch (error) {
      toast.error('Failed to save payment settings');
      logger.error('[settings] SAVE_PAYMENTS_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [stripeEnabled, paypalEnabled, cashEnabled]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSaveNotifications = useCallback(async () => {
    if (useLogging) {
      logger.info('[ui] FORM_SUBMIT_ATTEMPT', {
        feature: 'settings',
        section: 'notifications',
        payloadKeys: logDataEnabled ? ['emailNotifications', 'orderNotifications', 'lowStockAlerts', 'staffNotifications'] : undefined,
        sample: logFullDataEnabled
          ? samplePayload({ emailNotifications, orderNotifications, lowStockAlerts, staffNotifications })
          : undefined,
      });
    }
    logger.info('[settings] SAVE_NOTIFICATIONS_ATTEMPT');
    try {
      await settingsAdapter.saveNotifications({
        emailNotifications,
        orderNotifications,
        lowStockAlerts,
        staffNotifications,
      });
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_SUCCESS', {
          feature: 'settings',
          section: 'notifications',
          payloadKeys: logDataEnabled ? ['emailNotifications', 'orderNotifications', 'lowStockAlerts', 'staffNotifications'] : undefined,
        });
      }
      logger.info('[settings] SAVE_NOTIFICATIONS_SUCCESS');
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save notification settings');
      logger.error('[settings] SAVE_NOTIFICATIONS_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [emailNotifications, orderNotifications, lowStockAlerts, staffNotifications]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSaveSecurity = useCallback(async () => {
    if (useLogging) {
      logger.info('[ui] FORM_SUBMIT_ATTEMPT', {
        feature: 'settings',
        section: 'security',
        payloadKeys: logDataEnabled ? ['twoFactorEnabled', 'sessionTimeout'] : undefined,
        sample: logFullDataEnabled ? samplePayload({ twoFactorEnabled, sessionTimeout }) : undefined,
      });
    }
    logger.info('[settings] SAVE_SECURITY_ATTEMPT', { twoFactorEnabled, sessionTimeout });
    try {
      await settingsAdapter.saveTenantSecurity({ twoFactorEnabled, sessionTimeout });
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_SUCCESS', {
          feature: 'settings',
          section: 'security',
          payloadKeys: logDataEnabled ? ['twoFactorEnabled', 'sessionTimeout'] : undefined,
        });
      }
      logger.info('[settings] SAVE_SECURITY_SUCCESS');
      toast.success('Security settings saved');
    } catch (error) {
      toast.error('Failed to save security settings');
      logger.error('[settings] SAVE_SECURITY_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [twoFactorEnabled, sessionTimeout]);

  useEffect(() => {
    if (!useLogging || viewModelLoggedRef.current) return;
    const keys = Object.keys(initialState ?? {}).slice(0, 12);
    logger.info('[ui] VIEWMODEL_APPLIED', {
      feature: 'settings',
      section: 'tenant-profile',
      modelKeys: logDataEnabled ? keys : undefined,
      sample: logFullDataEnabled ? samplePayload(initialState) : undefined,
    });
    viewModelLoggedRef.current = true;
  }, [initialState, logDataEnabled, logFullDataEnabled, useLogging]);

  return {
    // State
    activeTab,
    restaurantName,
    urlSlug,
    address,
    phone,
    email,
    description,
    defaultLanguage,
    theme,
    timezone,
    logoPreview,
    coverUploaded,
    openingHours,
    sourceDay,
    stripeEnabled,
    paypalEnabled,
    cashEnabled,
    emailNotifications,
    orderNotifications,
    lowStockAlerts,
    staffNotifications,
    twoFactorEnabled,
    sessionTimeout,
    slugPreview,

    // Setters
    setActiveTab,
    setRestaurantName,
    setUrlSlug,
    setAddress,
    setPhone,
    setEmail,
    setDescription,
    setDefaultLanguage,
    setTheme,
    setTimezone,
    setLogoPreview,
    setCoverUploaded,
    setOpeningHours,
    setSourceDay,
    setStripeEnabled,
    setPaypalEnabled,
    setCashEnabled,
    setEmailNotifications,
    setOrderNotifications,
    setLowStockAlerts,
    setStaffNotifications,
    setTwoFactorEnabled,
    setSessionTimeout,

    // Handlers
    handleSaveProfile,
    handleCopyHoursToAll,
    handleSaveHours,
    handleSavePayments,
    handleSaveNotifications,
    handleSaveSecurity,
  };
}
