"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useChangePassword } from './queries/useChangePassword'
import type { ChangePasswordForm, FormErrors, TouchedFields, PasswordStrength } from '../model'

export function useChangePasswordController() {
  const router = useRouter()
  const changePasswordMutation = useChangePassword()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<TouchedFields>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) {
      return { score: 0, label: '', color: '', bgColor: '' }
    }
    
    let score = 0
    
    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    
    // Determine strength level
    if (score <= 2) {
      return { score, label: 'Weak', color: 'var(--red-500)', bgColor: 'var(--red-100)' }
    } else if (score <= 4) {
      return { score, label: 'Medium', color: 'var(--orange-500)', bgColor: 'var(--orange-100)' }
    } else {
      return { score, label: 'Strong', color: 'var(--emerald-500)', bgColor: 'var(--emerald-100)' }
    }
  }

  const passwordStrength = calculatePasswordStrength(newPassword)

  // Validation logic
  const validateCurrentPassword = (value: string): string => {
    if (!value.trim()) {
      return 'Current password is required'
    }
    return ''
  }

  const validateNewPassword = (value: string): string => {
    if (!value.trim()) {
      return 'New password is required'
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters'
    }
    return ''
  }

  const validateConfirmPassword = (value: string, newPass: string): string => {
    if (!value.trim()) {
      return 'Please confirm your password'
    }
    if (value !== newPass) {
      return 'Passwords do not match'
    }
    return ''
  }

  // Check if form is valid
  const isCurrentPasswordValid = currentPassword.trim().length > 0
  const isNewPasswordValid = newPassword.trim().length >= 8
  const isConfirmPasswordValid = confirmPassword.trim().length > 0 && confirmPassword === newPassword
  const isFormValid = isCurrentPasswordValid && isNewPasswordValid && isConfirmPasswordValid

  const handleCurrentPasswordBlur = () => {
    setTouched({ ...touched, currentPassword: true })
    const error = validateCurrentPassword(currentPassword)
    setErrors({ ...errors, currentPassword: error })
  }

  const handleNewPasswordBlur = () => {
    setTouched({ ...touched, newPassword: true })
    const error = validateNewPassword(newPassword)
    setErrors({ ...errors, newPassword: error })
    
    // Also revalidate confirm password if it's been touched
    if (touched.confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword, newPassword)
      setErrors({ ...errors, newPassword: error, confirmPassword: confirmError })
    }
  }

  const handleConfirmPasswordBlur = () => {
    setTouched({ ...touched, confirmPassword: true })
    const error = validateConfirmPassword(confirmPassword, newPassword)
    setErrors({ ...errors, confirmPassword: error })
  }

  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value)
    if (touched.currentPassword) {
      const error = validateCurrentPassword(value)
      setErrors({ ...errors, currentPassword: error })
    }
  }

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value)
    if (touched.newPassword) {
      const newPasswordError = validateNewPassword(value)
      setErrors({ ...errors, newPassword: newPasswordError })
    }
    // Also revalidate confirm password if it's been touched
    if (touched.confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword, value)
      const newPasswordError = validateNewPassword(value)
      setErrors({ ...errors, newPassword: newPasswordError, confirmPassword: confirmError })
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(value, newPassword)
      setErrors({ ...errors, confirmPassword: error })
    }
  }

  const handleSubmit = () => {
    // Mark all as touched
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    })

    // Validate all fields
    const currentError = validateCurrentPassword(currentPassword)
    const newError = validateNewPassword(newPassword)
    const confirmError = validateConfirmPassword(confirmPassword, newPassword)

    setErrors({
      currentPassword: currentError,
      newPassword: newError,
      confirmPassword: confirmError,
    })

    // If no errors, proceed
    if (!currentError && !newError && !confirmError) {
      changePasswordMutation.mutate(
        { currentPassword, newPassword },
        {
          onSuccess: (response) => {
            if (response.success) {
              toast.success('Password changed successfully!')
              router.back()
            } else {
              toast.error('Failed to change password')
            }
          },
          onError: () => {
            toast.error('An error occurred')
          },
        }
      )
    }
  }

  const handleBack = () => {
    router.back()
  }

  return {
    // State
    currentPassword,
    newPassword,
    confirmPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    errors,
    touched,
    passwordStrength,
    isFormValid,
    isSubmitting: changePasswordMutation.isPending,
    
    // Actions
    setShowCurrentPassword,
    setShowNewPassword,
    setShowConfirmPassword,
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleCurrentPasswordBlur,
    handleNewPasswordBlur,
    handleConfirmPasswordBlur,
    handleSubmit,
    handleBack,
  }
}
