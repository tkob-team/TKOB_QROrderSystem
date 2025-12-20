'use client'

import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/api/services/auth.service';

export function ChangePasswordPage() {
  const router = useRouter();
  
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      AuthService.changePassword(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Password changed successfully!');
        router.back();
      } else {
        toast.error('Failed to change password');
      }
    },
    onError: () => {
      toast.error('An error occurred');
    }
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Password strength calculation
  const calculatePasswordStrength = (password: string): { score: number; label: string; color: string; bgColor: string } => {
    if (password.length === 0) {
      return { score: 0, label: '', color: '', bgColor: '' };
    }
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // Determine strength level
    if (score <= 2) {
      return { score, label: 'Weak', color: 'var(--red-500)', bgColor: 'var(--red-100)' };
    } else if (score <= 4) {
      return { score, label: 'Medium', color: 'var(--orange-500)', bgColor: 'var(--orange-100)' };
    } else {
      return { score, label: 'Strong', color: 'var(--emerald-500)', bgColor: 'var(--emerald-100)' };
    }
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  // Validation logic
  const validateCurrentPassword = (value: string) => {
    if (!value.trim()) {
      return 'Current password is required';
    }
    return '';
  };

  const validateNewPassword = (value: string) => {
    if (!value.trim()) {
      return 'New password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  };

  const validateConfirmPassword = (value: string, newPass: string) => {
    if (!value.trim()) {
      return 'Please confirm your password';
    }
    if (value !== newPass) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Check if form is valid
  const isCurrentPasswordValid = currentPassword.trim().length > 0;
  const isNewPasswordValid = newPassword.trim().length >= 8;
  const isConfirmPasswordValid = confirmPassword.trim().length > 0 && confirmPassword === newPassword;
  const isFormValid = isCurrentPasswordValid && isNewPasswordValid && isConfirmPasswordValid;

  const handleCurrentPasswordBlur = () => {
    setTouched({ ...touched, currentPassword: true });
    const error = validateCurrentPassword(currentPassword);
    setErrors({ ...errors, currentPassword: error });
  };

  const handleNewPasswordBlur = () => {
    setTouched({ ...touched, newPassword: true });
    const error = validateNewPassword(newPassword);
    setErrors({ ...errors, newPassword: error });
    
    // Also revalidate confirm password if it's been touched
    if (touched.confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword, newPassword);
      setErrors({ ...errors, newPassword: error, confirmPassword: confirmError });
    }
  };

  const handleConfirmPasswordBlur = () => {
    setTouched({ ...touched, confirmPassword: true });
    const error = validateConfirmPassword(confirmPassword, newPassword);
    setErrors({ ...errors, confirmPassword: error });
  };

  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value);
    if (touched.currentPassword) {
      const error = validateCurrentPassword(value);
      setErrors({ ...errors, currentPassword: error });
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (touched.newPassword) {
      const newPasswordError = validateNewPassword(value);
      setErrors({ ...errors, newPassword: newPasswordError });
    }
    // Also revalidate confirm password if it's been touched
    if (touched.confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword, value);
      const newPasswordError = validateNewPassword(value);
      setErrors({ ...errors, newPassword: newPasswordError, confirmPassword: confirmError });
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(value, newPassword);
      setErrors({ ...errors, confirmPassword: error });
    }
  };

  const handleSubmit = () => {
    // Mark all as touched
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Validate all fields
    const currentError = validateCurrentPassword(currentPassword);
    const newError = validateNewPassword(newPassword);
    const confirmError = validateConfirmPassword(confirmPassword, newPassword);

    setErrors({
      currentPassword: currentError,
      newPassword: newError,
      confirmPassword: confirmError,
    });

    // If no errors, proceed
    if (!currentError && !newError && !confirmError) {
      // Call API to change password
      changePasswordMutation.mutate({
        currentPassword,
        newPassword
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <h2 style={{ color: 'var(--gray-900)' }}>Change password</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6" style={{ borderLeft: '4px solid var(--blue-500)' }}>
          <p style={{ color: 'var(--gray-700)', fontSize: '14px' }}>
            Create a strong password with at least 8 characters. For your security, avoid reusing passwords from other sites.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label 
              htmlFor="currentPassword" 
              className="block mb-2"
              style={{ color: 'var(--gray-700)', fontSize: '14px' }}
            >
              Current password <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
              </div>
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => handleCurrentPasswordChange(e.target.value)}
                onBlur={handleCurrentPasswordBlur}
                placeholder="Enter current password"
                className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  errors.currentPassword && touched.currentPassword
                    ? 'border-[var(--red-500)] focus:ring-[var(--red-200)] focus:border-[var(--red-500)]'
                    : 'focus:ring-[var(--orange-200)] focus:border-[var(--orange-500)]'
                }`}
                style={{ 
                  borderColor: errors.currentPassword && touched.currentPassword ? 'var(--red-500)' : 'var(--gray-300)',
                  fontSize: '15px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                ) : (
                  <Eye className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                )}
              </button>
            </div>
            {errors.currentPassword && touched.currentPassword && (
              <p style={{ color: 'var(--red-500)', fontSize: '13px', marginTop: '6px' }}>
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label 
              htmlFor="newPassword" 
              className="block mb-2"
              style={{ color: 'var(--gray-700)', fontSize: '14px' }}
            >
              New password <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                onBlur={handleNewPasswordBlur}
                placeholder="Enter new password"
                className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  errors.newPassword && touched.newPassword
                    ? 'border-[var(--red-500)] focus:ring-[var(--red-200)] focus:border-[var(--red-500)]'
                    : 'focus:ring-[var(--orange-200)] focus:border-[var(--orange-500)]'
                }`}
                style={{ 
                  borderColor: errors.newPassword && touched.newPassword ? 'var(--red-500)' : 'var(--gray-300)',
                  fontSize: '15px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                ) : (
                  <Eye className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                )}
              </button>
            </div>
            {errors.newPassword && touched.newPassword && (
              <p style={{ color: 'var(--red-500)', fontSize: '13px', marginTop: '6px' }}>
                {errors.newPassword}
              </p>
            )}
            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="mt-3">
                {/* Strength bar */}
                <div className="flex gap-1 mb-2">
                  <div 
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: passwordStrength.score >= 1 ? passwordStrength.color : 'var(--gray-200)' 
                    }}
                  />
                  <div 
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: passwordStrength.score >= 3 ? passwordStrength.color : 'var(--gray-200)' 
                    }}
                  />
                  <div 
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: passwordStrength.score >= 5 ? passwordStrength.color : 'var(--gray-200)' 
                    }}
                  />
                </div>
                {/* Strength label */}
                <div className="flex items-center gap-2">
                  <span style={{ color: passwordStrength.color, fontSize: '13px', fontWeight: '500' }}>
                    {passwordStrength.label}
                  </span>
                  {passwordStrength.score < 5 && (
                    <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                      • Use uppercase, numbers & symbols for a stronger password
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block mb-2"
              style={{ color: 'var(--gray-700)', fontSize: '14px' }}
            >
              Confirm new password <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onBlur={handleConfirmPasswordBlur}
                placeholder="Re-enter new password"
                className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-[var(--red-500)] focus:ring-[var(--red-200)] focus:border-[var(--red-500)]'
                    : 'focus:ring-[var(--orange-200)] focus:border-[var(--orange-500)]'
                }`}
                style={{ 
                  borderColor: errors.confirmPassword && touched.confirmPassword ? 'var(--red-500)' : 'var(--gray-300)',
                  fontSize: '15px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                ) : (
                  <Eye className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                )}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p style={{ color: 'var(--red-500)', fontSize: '13px', marginTop: '6px' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Primary CTA - Full width button at bottom of form */}
        <div className="mt-8 mb-6">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full py-3.5 px-4 rounded-full transition-all ${
              !isFormValid 
                ? 'cursor-not-allowed' 
                : 'hover:shadow-md active:scale-98'
            }`}
            style={{
              backgroundColor: !isFormValid ? 'var(--gray-300)' : 'var(--red-500)',
              color: !isFormValid ? 'var(--gray-500)' : 'white',
              minHeight: '52px',
              opacity: !isFormValid ? 0.6 : 1,
            }}
          >
            Change password
          </button>
        </div>
      </div>
    </div>
  );
}