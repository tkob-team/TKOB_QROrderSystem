/**
 * useAccountSettingsController - Public Controller Hook
 * Orchestrates all account settings state, handlers, and queries
 */

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAccountSettings } from './queries/useAccountSettings';
import { settingsAdapter } from '../data/factory';
import { validateDisplayName, validatePassword, validate2FACode } from '../utils';
import type { AccountSettingsTab, AccountSettingsState } from '../model/types';

const DEFAULT_STATE: AccountSettingsState = {
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

export function useAccountSettingsController() {
  const { state: queriedState } = useAccountSettings();

  // Initialize from query or defaults
  const initialState = queriedState || DEFAULT_STATE;

  const [activeTab, setActiveTab] = useState<AccountSettingsTab>(initialState.activeTab);
  const [displayName, setDisplayName] = useState(initialState.displayName);
  const [avatarColor, setAvatarColor] = useState(initialState.avatarColor);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialState.twoFactorEnabled);
  const [verificationCode, setVerificationCode] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const email = useMemo(() => initialState.email, [initialState.email]);
  const avatarInitials = useMemo(() => initialState.avatarInitials, [initialState.avatarInitials]);

  const handleSaveProfile = useCallback(async () => {
    const validation = validateDisplayName(displayName);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }
    setIsSavingProfile(true);
    try {
      await settingsAdapter.saveAccountProfile({ displayName, avatarColor });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to save profile');
      console.error(error);
    } finally {
      setIsSavingProfile(false);
    }
  }, [displayName, avatarColor]);

  const handleSavePassword = useCallback(async () => {
    const validation = validatePassword(currentPassword, newPassword, confirmPassword);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }
    setIsSavingPassword(true);
    try {
      await settingsAdapter.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password');
      console.error(error);
    } finally {
      setIsSavingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleEnable2FA = useCallback(async () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      await settingsAdapter.setAccount2FA({ enabled: false });
      toast.success('Two-factor authentication disabled');
      return;
    }
    const validation = validate2FACode(verificationCode);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }
    setIsVerifying(true);
    try {
      await settingsAdapter.setAccount2FA({ enabled: true, verificationCode });
      setTwoFactorEnabled(true);
      setVerificationCode('');
      toast.success('Two-factor authentication enabled');
    } catch (error) {
      toast.error('Failed to enable 2FA');
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  }, [twoFactorEnabled, verificationCode]);

  return {
    // State
    activeTab,
    displayName,
    email,
    avatarInitials,
    avatarColor,
    currentPassword,
    newPassword,
    confirmPassword,
    showCurrent,
    showNew,
    showConfirm,
    twoFactorEnabled,
    verificationCode,
    isSavingProfile,
    isSavingPassword,
    isVerifying,

    // Setters
    setActiveTab,
    setDisplayName,
    setAvatarColor,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setShowCurrent,
    setShowNew,
    setShowConfirm,
    setVerificationCode,

    // Handlers
    handleSaveProfile,
    handleSavePassword,
    handleEnable2FA,
  };
}
