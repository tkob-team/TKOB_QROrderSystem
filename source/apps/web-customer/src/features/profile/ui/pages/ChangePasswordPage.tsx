'use client'

import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'
import { useChangePasswordController } from '../../hooks'
import { PROFILE_TEXT } from '../../model'

export function ChangePasswordPage() {
  const controller = useChangePasswordController()
  const t = PROFILE_TEXT.EN // Static for now

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={controller.handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <h2 style={{ color: 'var(--gray-900)' }}>{t.changePasswordTitle}</h2>
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
              {t.currentPassword} <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
              </div>
              <input
                id="currentPassword"
                type={controller.showCurrentPassword ? 'text' : 'password'}
                value={controller.currentPassword}
                onChange={(e) => controller.handleCurrentPasswordChange(e.target.value)}
                onBlur={controller.handleCurrentPasswordBlur}
                placeholder={t.currentPasswordPlaceholder}
                className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  controller.errors.currentPassword && controller.touched.currentPassword
                    ? 'border-[var(--red-500)] focus:ring-[var(--red-200)] focus:border-[var(--red-500)]'
                    : 'focus:ring-[var(--orange-200)] focus:border-[var(--orange-500)]'
                }`}
                style={{ 
                  borderColor: controller.errors.currentPassword && controller.touched.currentPassword ? 'var(--red-500)' : 'var(--gray-300)',
                  fontSize: '15px'
                }}
              />
              <button
                type="button"
                onClick={() => controller.setShowCurrentPassword(!controller.showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {controller.showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                ) : (
                  <Eye className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                )}
              </button>
            </div>
            {controller.errors.currentPassword && controller.touched.currentPassword && (
              <p style={{ color: 'var(--red-500)', fontSize: '13px', marginTop: '6px' }}>
                {controller.errors.currentPassword}
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
              {t.newPassword} <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
              </div>
              <input
                id="newPassword"
                type={controller.showNewPassword ? 'text' : 'password'}
                value={controller.newPassword}
                onChange={(e) => controller.handleNewPasswordChange(e.target.value)}
                onBlur={controller.handleNewPasswordBlur}
                placeholder={t.newPasswordPlaceholder}
                className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  controller.errors.newPassword && controller.touched.newPassword
                    ? 'border-[var(--red-500)] focus:ring-[var(--red-200)] focus:border-[var(--red-500)]'
                    : 'focus:ring-[var(--orange-200)] focus:border-[var(--orange-500)]'
                }`}
                style={{ 
                  borderColor: controller.errors.newPassword && controller.touched.newPassword ? 'var(--red-500)' : 'var(--gray-300)',
                  fontSize: '15px'
                }}
              />
              <button
                type="button"
                onClick={() => controller.setShowNewPassword(!controller.showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {controller.showNewPassword ? (
                  <EyeOff className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                ) : (
                  <Eye className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                )}
              </button>
            </div>
            {controller.errors.newPassword && controller.touched.newPassword && (
              <p style={{ color: 'var(--red-500)', fontSize: '13px', marginTop: '6px' }}>
                {controller.errors.newPassword}
              </p>
            )}
            {/* Password Strength Indicator */}
            {controller.newPassword.length > 0 && (
              <div className="mt-3">
                <div className="flex gap-1 mb-2">
                  <div 
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: controller.passwordStrength.score >= 1 ? controller.passwordStrength.color : 'var(--gray-200)' 
                    }}
                  />
                  <div 
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: controller.passwordStrength.score >= 3 ? controller.passwordStrength.color : 'var(--gray-200)' 
                    }}
                  />
                  <div 
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: controller.passwordStrength.score >= 5 ? controller.passwordStrength.color : 'var(--gray-200)' 
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: controller.passwordStrength.color, fontSize: '13px', fontWeight: '500' }}>
                    {controller.passwordStrength.label}
                  </span>
                  {controller.passwordStrength.score < 5 && (
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
              {t.confirmPassword} <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
              </div>
              <input
                id="confirmPassword"
                type={controller.showConfirmPassword ? 'text' : 'password'}
                value={controller.confirmPassword}
                onChange={(e) => controller.handleConfirmPasswordChange(e.target.value)}
                onBlur={controller.handleConfirmPasswordBlur}
                placeholder={t.confirmPasswordPlaceholder}
                className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  controller.errors.confirmPassword && controller.touched.confirmPassword
                    ? 'border-[var(--red-500)] focus:ring-[var(--red-200)] focus:border-[var(--red-500)]'
                    : 'focus:ring-[var(--orange-200)] focus:border-[var(--orange-500)]'
                }`}
                style={{ 
                  borderColor: controller.errors.confirmPassword && controller.touched.confirmPassword ? 'var(--red-500)' : 'var(--gray-300)',
                  fontSize: '15px'
                }}
              />
              <button
                type="button"
                onClick={() => controller.setShowConfirmPassword(!controller.showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {controller.showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                ) : (
                  <Eye className="w-5 h-5" style={{ color: 'var(--gray-400)' }} />
                )}
              </button>
            </div>
            {controller.errors.confirmPassword && controller.touched.confirmPassword && (
              <p style={{ color: 'var(--red-500)', fontSize: '13px', marginTop: '6px' }}>
                {controller.errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 mb-6">
          <button
            onClick={controller.handleSubmit}
            disabled={!controller.isFormValid}
            className={`w-full py-3.5 px-4 rounded-full transition-all ${
              !controller.isFormValid 
                ? 'cursor-not-allowed' 
                : 'hover:shadow-md active:scale-98'
            }`}
            style={{
              backgroundColor: !controller.isFormValid ? 'var(--gray-300)' : 'var(--red-500)',
              color: !controller.isFormValid ? 'var(--gray-500)' : 'white',
              minHeight: '52px',
              opacity: !controller.isFormValid ? 0.6 : 1,
            }}
          >
            {t.changePasswordButton}
          </button>
        </div>
      </div>
    </div>
  )
}
