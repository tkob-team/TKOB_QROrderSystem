'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components';
import { User, LogOut, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AccountPasswordSection } from '@/features/settings/ui/components/sections/account';
import { useAuthController } from '@/features/auth/hooks';
import { toast } from 'sonner';

interface StaffProfilePageProps {
  userRole: 'kds' | 'waiter';
}

export function StaffProfilePage({ userRole }: StaffProfilePageProps) {
  const router = useRouter();
  const authController = useAuthController({ enabledCurrentUser: true });
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const user = authController.currentUserQuery.data?.user;
  const roleLabel = userRole === 'kds' ? 'Kitchen Staff' : 'Waiter';
  const roleColor = userRole === 'kds' ? 'orange' : 'blue';

  // Initialize fullName when user data loads
  React.useEffect(() => {
    if (user?.fullName && !fullName) {
      setFullName(user.fullName);
    }
  }, [user, fullName]);

  const handleSaveName = async () => {
    if (!fullName || fullName.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setIsSavingName(true);
    try {
      const result = await authController.adapter.updateProfile({ fullName });

      if (result.success) {
        toast.success('Name updated successfully');
        setIsEditingName(false);
        authController.currentUserQuery.refetch(); // Refresh user data
      } else {
        toast.error(result.message || 'Failed to update name');
      }
    } catch (error) {
      toast.error('An error occurred while updating name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSavePassword = async () => {
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

    setIsSaving(true);
    try {
      const result = await authController.adapter.changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        toast.success('Password changed successfully');
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('An error occurred while changing password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken') || '';
    await authController.logout(refreshToken);
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Profile Settings</h1>
            <p className="text-neutral-600 mt-1">Manage your account settings</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* User Info Card */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={userRole === 'kds' 
              ? 'w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center'
              : 'w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center'
            }>
              <User className={userRole === 'kds' ? 'w-6 h-6 text-orange-600' : 'w-6 h-6 text-blue-600'} />
            </div>
            <div>
              <h3 className="text-text-primary font-semibold">Personal Information</h3>
              <p className="text-text-secondary text-sm">Your account details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Editable Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-secondary">Full Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setIsEditingName(true);
                  }}
                  className="flex-1 px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  placeholder="Enter your full name"
                />
                {isEditingName && (
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingName ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-secondary">Email</label>
              <div className="px-4 py-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="text-text-primary">{user?.email || 'Loading...'}</p>
              </div>
            </div>

            {/* Role (read-only) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-secondary">Role</label>
              <div className="px-4 py-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className={userRole === 'kds'
                  ? 'inline-flex px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700'
                  : 'inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700'
                }>
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Password Change Section */}
        <AccountPasswordSection
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          showCurrent={showCurrent}
          showNew={showNew}
          showConfirm={showConfirm}
          isSaving={isSaving}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onShowCurrentToggle={() => setShowCurrent(!showCurrent)}
          onShowNewToggle={() => setShowNew(!showNew)}
          onShowConfirmToggle={() => setShowConfirm(!showConfirm)}
          onSave={handleSavePassword}
        />
      </div>
    </div>
  );
}
