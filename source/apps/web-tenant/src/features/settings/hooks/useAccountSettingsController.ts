/**
 * useAccountSettingsController - Public Controller Hook
 * Handles profile (tenant name) and password change (backed by real API)
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { logger } from '@/shared/utils/logger';
import { useAuth } from '@/shared/context/AuthContext';
import { settingsAdapter } from '../data/factory';
import { validatePassword } from '../utils';
import type { AccountSettingsTab } from '../model/types';

export function useAccountSettingsController() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountSettingsTab>('profile');
  const [tenantName, setTenantName] = useState(user?.tenant?.name || '');
  const [email] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Update tenant name when user changes
  useEffect(() => {
    if (user?.tenant?.name) {
      setTenantName(user.tenant.name);
    }
  }, [user?.tenant?.name]);

  const handleSaveProfile = useCallback(async () => {
    if (!tenantName.trim()) {
      toast.error('Restaurant name is required');
      return;
    }

    logger.info('[settings] SAVE_TENANT_NAME_ATTEMPT');
    setIsSavingProfile(true);
    
    try {
      await settingsAdapter.saveTenantProfile({ restaurantName: tenantName });
      logger.info('[settings] SAVE_TENANT_NAME_SUCCESS');
      toast.success('Restaurant name updated successfully');
      
      // Reload page to refresh auth context with new tenant name
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update restaurant name';
      toast.error(errorMessage);
      logger.error('[settings] TENANT_NAME_SAVE_ERROR', { message: errorMessage });
    } finally {
      setIsSavingProfile(false);
    }
  }, [tenantName]);

  const handleSavePassword = useCallback(async () => {
    const validation = validatePassword(currentPassword, newPassword, confirmPassword);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }

    logger.info('[settings] CHANGE_PASSWORD_ATTEMPT');
    setIsSavingPassword(true);
    
    try {
      await settingsAdapter.changePassword({ currentPassword, newPassword });
      logger.info('[settings] CHANGE_PASSWORD_SUCCESS');
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(errorMessage);
      logger.error('[settings] PASSWORD_CHANGE_ERROR', { message: errorMessage });
    } finally {
      setIsSavingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return {
    // Tab State
    activeTab,
    setActiveTab,
    
    // Profile State
    tenantName,
    email,
    isSavingProfile,
    setTenantName,
    handleSaveProfile,
    
    // Password State
    currentPassword,
    newPassword,
    confirmPassword,
    showCurrent,
    showNew,
    showConfirm,
    isSavingPassword,

    // Password Setters
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setShowCurrent,
    setShowNew,
    setShowConfirm,

    // Password Handler
    handleSavePassword,
  };
}
