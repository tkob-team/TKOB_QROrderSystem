'use client';

import React from 'react';
import { useAccountSettingsController } from '../../hooks';
import {
  AccountProfileSection,
  AccountPasswordSection,
  Account2FASection,
} from '../components/sections';



export function AccountSettingsPage() {
  const controller = useAccountSettingsController();

  return (
    <div className="flex flex-col gap-6 px-6 pt-6 pb-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary">Account Settings</h1>
        <p className="text-text-secondary text-sm">
          Manage your profile, password, and security preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-default">
        <div className="flex gap-2">
          <button
            onClick={() => controller.setActiveTab('profile')}
            className={`px-4 py-3 relative text-sm font-semibold transition-colors ${
              controller.activeTab === 'profile' ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Profile
            {controller.activeTab === 'profile' && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent-500" />}
          </button>
          <button
            onClick={() => controller.setActiveTab('security')}
            className={`px-4 py-3 relative text-sm font-semibold transition-colors ${
              controller.activeTab === 'security' ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Security
            {controller.activeTab === 'security' && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent-500" />}
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {controller.activeTab === 'profile' && (
        <AccountProfileSection
          displayName={controller.displayName}
          email={controller.email}
          avatarColor={controller.avatarColor}
          avatarInitials={controller.avatarInitials}
          isSaving={controller.isSavingProfile}
          onDisplayNameChange={controller.setDisplayName}
          onAvatarColorChange={controller.setAvatarColor}
          onSave={controller.handleSaveProfile}
        />
      )}

      {/* Security Tab */}
      {controller.activeTab === 'security' && (
        <div className="flex flex-col gap-6">
          <AccountPasswordSection
            currentPassword={controller.currentPassword}
            newPassword={controller.newPassword}
            confirmPassword={controller.confirmPassword}
            showCurrent={controller.showCurrent}
            showNew={controller.showNew}
            showConfirm={controller.showConfirm}
            isSaving={controller.isSavingPassword}
            onCurrentPasswordChange={controller.setCurrentPassword}
            onNewPasswordChange={controller.setNewPassword}
            onConfirmPasswordChange={controller.setConfirmPassword}
            onShowCurrentToggle={() => controller.setShowCurrent(!controller.showCurrent)}
            onShowNewToggle={() => controller.setShowNew(!controller.showNew)}
            onShowConfirmToggle={() => controller.setShowConfirm(!controller.showConfirm)}
            onSave={controller.handleSavePassword}
          />

          <Account2FASection
            verificationCode={controller.verificationCode}
            twoFactorEnabled={controller.twoFactorEnabled}
            isVerifying={controller.isVerifying}
            onVerificationCodeChange={controller.setVerificationCode}
            onEnable={controller.handleEnable2FA}
          />
        </div>
      )}
    </div>
  );
}
