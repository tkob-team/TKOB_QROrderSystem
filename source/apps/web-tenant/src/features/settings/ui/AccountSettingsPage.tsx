'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, Input, Button } from '@/shared/components';
import { Eye, EyeOff, Shield, Upload, User as UserIcon, Smartphone, Lock } from 'lucide-react';

const avatarPalette = [
  { color: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Emerald' },
  { color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600', label: 'Blue' },
  { color: 'amber', bg: 'bg-amber-100', text: 'text-amber-600', label: 'Amber' },
  { color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-600', label: 'Indigo' },
  { color: 'rose', bg: 'bg-rose-100', text: 'text-rose-600', label: 'Rose' },
  { color: 'teal', bg: 'bg-teal-100', text: 'text-teal-600', label: 'Teal' },
];

export function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile state
  const [displayName, setDisplayName] = useState('TKOB Admin');
  const [email] = useState('admin@tkqr.com');
  const [avatarInitials] = useState('TA');
  const [avatarColor, setAvatarColor] = useState('emerald');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const currentAvatar = useMemo(() => {
    return avatarPalette.find((a) => a.color === avatarColor) || avatarPalette[0];
  }, [avatarColor]);

  const handleSaveProfile = () => {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    setIsSavingProfile(true);
    setTimeout(() => {
      toast.success('Profile updated');
      setIsSavingProfile(false);
    }, 800);
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsSavingPassword(true);
    setTimeout(() => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSavingPassword(false);
    }, 900);
  };

  const handleEnable2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      toast.success('Two-factor authentication disabled');
      return;
    }
    if (verificationCode.length !== 6) {
      toast.error('Enter the 6-digit code to enable 2FA');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setTwoFactorEnabled(true);
      setVerificationCode('');
      setIsVerifying(false);
      toast.success('Two-factor authentication enabled');
    }, 900);
  };

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
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 relative text-sm font-semibold transition-colors ${
              activeTab === 'profile' ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Profile
            {activeTab === 'profile' && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent-500" />}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 relative text-sm font-semibold transition-colors ${
              activeTab === 'security' ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Security
            {activeTab === 'security' && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent-500" />}
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <Card className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-elevated rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-text-secondary" />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold">Profile</h3>
                <p className="text-text-secondary text-sm">Update your personal information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
              />
              <Input
                label="Email"
                value={email}
                disabled
                helperText="Email is managed by your provider"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-text-primary text-sm font-semibold">Avatar</label>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${currentAvatar.bg} rounded-full flex items-center justify-center`}>
                  <span className={`${currentAvatar.text} text-base font-bold`}>
                    {avatarInitials}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {avatarPalette.map((avatar) => (
                    <button
                      key={avatar.color}
                      onClick={() => setAvatarColor(avatar.color)}
                      className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        avatarColor === avatar.color
                          ? 'border-accent-500 bg-accent-50 text-accent-600'
                          : 'border-default text-text-secondary hover:border-accent-300'
                      }`}
                    >
                      {avatar.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-text-tertiary" />
                <span className="text-sm text-text-secondary">Avatar upload is simulated in demo mode</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-default">
              <Button variant="secondary" onClick={() => toast('Changes discarded')}>Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold">Change Password</h3>
                <p className="text-text-secondary text-sm">Keep your account secure with a strong password</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                  >
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => toast('Password change cancelled')}>Cancel</Button>
              <Button onClick={handleSavePassword} disabled={isSavingPassword}>
                {isSavingPassword ? 'Saving…' : 'Update Password'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold">Two-Factor Authentication</h3>
                <p className="text-text-secondary text-sm">Add an extra layer of security to your account</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-text-primary">Verification Code</label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Lock className="w-4 h-4" />
                Codes are simulated for demo purposes.
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => toast('2FA setup later')}>Maybe later</Button>
              <Button onClick={handleEnable2FA} disabled={isVerifying}>
                {twoFactorEnabled ? 'Disable 2FA' : isVerifying ? 'Verifying…' : 'Enable 2FA'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
