/**
 * useTenantProfileController - Public Controller Hook
 * Orchestrates all tenant profile state, handlers, and queries
 */

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useTenantProfileSettings } from './queries/useTenantProfileSettings';
import { settingsAdapter } from '../data/factory';
import { buildSlugPreview, copyHoursToAllDays, validateRestaurantName } from '../utils';
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

  // Initialize from query or defaults
  const initialState = queriedState || DEFAULT_STATE;

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

  const handleSaveProfile = useCallback(async () => {
    const validation = validateRestaurantName(restaurantName);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }
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
      toast.success('Profile saved');
    } catch (error) {
      toast.error('Failed to save profile');
      console.error(error);
    }
  }, [restaurantName, urlSlug, address, phone, email, description, defaultLanguage, theme, timezone, logoPreview, coverUploaded]);

  const handleCopyHoursToAll = useCallback(() => {
    const updatedHours = copyHoursToAllDays(openingHours, sourceDay);
    setOpeningHours(updatedHours);
    toast.success('Copied hours to all days');
  }, [openingHours, sourceDay]);

  const handleSaveHours = useCallback(async () => {
    try {
      await settingsAdapter.saveOpeningHours(openingHours);
      toast.success('Opening hours saved');
    } catch (error) {
      toast.error('Failed to save opening hours');
      console.error(error);
    }
  }, [openingHours]);

  const handleSavePayments = useCallback(async () => {
    try {
      await settingsAdapter.savePayments({ stripeEnabled, paypalEnabled, cashEnabled });
      toast.success('Payment settings saved');
    } catch (error) {
      toast.error('Failed to save payment settings');
      console.error(error);
    }
  }, [stripeEnabled, paypalEnabled, cashEnabled]);

  const handleSaveNotifications = useCallback(async () => {
    try {
      await settingsAdapter.saveNotifications({
        emailNotifications,
        orderNotifications,
        lowStockAlerts,
        staffNotifications,
      });
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save notification settings');
      console.error(error);
    }
  }, [emailNotifications, orderNotifications, lowStockAlerts, staffNotifications]);

  const handleSaveSecurity = useCallback(async () => {
    try {
      await settingsAdapter.saveTenantSecurity({ twoFactorEnabled, sessionTimeout });
      toast.success('Security settings saved');
    } catch (error) {
      toast.error('Failed to save security settings');
      console.error(error);
    }
  }, [twoFactorEnabled, sessionTimeout]);

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
