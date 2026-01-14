/**
 * useAccountSettingsController - Public Controller Hook
 * Orchestrates all account settings state, handlers, and queries
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { logger } from '@/shared/utils/logger';
import { useAccountSettings } from './queries/useAccountSettings';
import { settingsAdapter } from '../data/factory';
import { validateDisplayName, validatePassword, validate2FACode } from '../utils';
import { samplePayload } from '@/shared/utils/dataInspector';
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

  const useLogging = process.env.NEXT_PUBLIC_USE_LOGGING === 'true';
  const logDataEnabled = process.env.NEXT_PUBLIC_LOG_DATA === 'true';
  const logFullDataEnabled =
    process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
    process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';

  // Initialize from query or defaults
  const initialState = queriedState || DEFAULT_STATE;

  const viewModelLoggedRef = useRef(false);

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
    if (useLogging) {
      logger.info('[ui] FORM_SUBMIT_ATTEMPT', {
        feature: 'settings',
        section: 'account-profile',
        payloadKeys: logDataEnabled ? ['displayName', 'avatarColor'] : undefined,
        sample: logFullDataEnabled ? samplePayload({ displayName, avatarColor }) : undefined,
      });
    }
    logger.info('[settings] SAVE_ACCOUNT_PROFILE_ATTEMPT');
    setIsSavingProfile(true);
    try {
      await settingsAdapter.saveAccountProfile({ displayName, avatarColor });
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_SUCCESS', {
          feature: 'settings',
          section: 'account-profile',
          payloadKeys: logDataEnabled ? ['displayName', 'avatarColor'] : undefined,
        });
      }
      logger.info('[settings] SAVE_ACCOUNT_PROFILE_SUCCESS');
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to save profile');
      logger.error('[settings] ACCOUNT_SAVE_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsSavingProfile(false);
    }
  }, [displayName, avatarColor]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSavePassword = useCallback(async () => {
    const validation = validatePassword(currentPassword, newPassword, confirmPassword);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }
    if (useLogging) {
      logger.info('[ui] FORM_SUBMIT_ATTEMPT', {
        feature: 'settings',
        section: 'change-password',
        payloadKeys: logDataEnabled ? ['hasOldPassword', 'hasNewPassword', 'hasConfirmPassword'] : undefined,
        sample: logFullDataEnabled
          ? { hasOldPassword: !!currentPassword, hasNewPassword: !!newPassword, hasConfirmPassword: !!confirmPassword }
          : undefined,
      });
    }
    logger.info('[settings] CHANGE_PASSWORD_ATTEMPT');
    setIsSavingPassword(true);
    try {
      await settingsAdapter.changePassword({ currentPassword, newPassword });
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_SUCCESS', {
          feature: 'settings',
          section: 'change-password',
          payloadKeys: logDataEnabled ? ['hasOldPassword', 'hasNewPassword', 'hasConfirmPassword'] : undefined,
        });
      }
      logger.info('[settings] CHANGE_PASSWORD_SUCCESS');
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password');
      logger.error('[settings] PASSWORD_CHANGE_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsSavingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEnable2FA = useCallback(async () => {
    if (twoFactorEnabled) {
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_ATTEMPT', {
          feature: 'settings',
          section: 'two-factor',
          payloadKeys: logDataEnabled ? ['enabled'] : undefined,
          sample: logFullDataEnabled ? { enabled: false } : undefined,
        });
      }
      logger.info('[settings] DISABLE_2FA_ATTEMPT');
      setTwoFactorEnabled(false);
      await settingsAdapter.setAccount2FA({ enabled: false });
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_SUCCESS', {
          feature: 'settings',
          section: 'two-factor',
          payloadKeys: logDataEnabled ? ['enabled'] : undefined,
        });
      }
      logger.info('[settings] DISABLE_2FA_SUCCESS');
      toast.success('Two-factor authentication disabled');
      return;
    }
    const validation = validate2FACode(verificationCode);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }
    if (useLogging) {
      logger.info('[ui] FORM_SUBMIT_ATTEMPT', {
        feature: 'settings',
        section: 'two-factor',
        payloadKeys: logDataEnabled ? ['enabled', 'hasVerificationCode'] : undefined,
        sample: logFullDataEnabled ? { enabled: true, hasVerificationCode: !!verificationCode } : undefined,
      });
    }
    logger.info('[settings] ENABLE_2FA_ATTEMPT');
    setIsVerifying(true);
    try {
      await settingsAdapter.setAccount2FA({ enabled: true, verificationCode });
      if (useLogging) {
        logger.info('[ui] FORM_SUBMIT_SUCCESS', {
          feature: 'settings',
          section: 'two-factor',
          payloadKeys: logDataEnabled ? ['enabled', 'hasVerificationCode'] : undefined,
        });
      }
      logger.info('[settings] ENABLE_2FA_SUCCESS');
      setTwoFactorEnabled(true);
      setVerificationCode('');
      toast.success('Two-factor authentication enabled');
    } catch (error) {
      toast.error('Failed to enable 2FA');
      logger.error('[settings] 2FA_ERROR', { message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsVerifying(false);
    }
  }, [twoFactorEnabled, verificationCode]);

  useEffect(() => {
    if (!useLogging || viewModelLoggedRef.current) return;
    const keys = Object.keys(initialState ?? {}).slice(0, 12);
    logger.info('[ui] VIEWMODEL_APPLIED', {
      feature: 'settings',
      section: 'account-settings',
      modelKeys: logDataEnabled ? keys : undefined,
      sample: logFullDataEnabled ? samplePayload(initialState) : undefined,
    });
    viewModelLoggedRef.current = true;
  }, [initialState, logDataEnabled, logFullDataEnabled, useLogging]);

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
