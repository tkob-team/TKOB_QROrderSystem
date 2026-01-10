"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLogin } from './queries/useLogin'
import { useRegister } from './queries/useRegister'
import { useRequestPasswordReset } from './queries/useRequestPasswordReset'
import { useResetPassword } from './queries/useResetPassword'
import { useVerifyEmail } from './queries/useVerifyEmail'
import { useResendVerification } from './queries/useResendVerification'
import type { LoginForm, RegisterForm, ResetPasswordRequestForm, ResetPasswordForm } from '../model'

export function useAuthController() {
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const requestResetMutation = useRequestPasswordReset()
  const resetPasswordMutation = useResetPassword()
  const verifyEmailMutation = useVerifyEmail()
  const resendVerificationMutation = useResendVerification()

  // Login actions
  const handleLogin = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success('Login successful!')
          router.push('/menu')
        } else {
          toast.error('Invalid email or password')
        }
      },
      onError: () => {
        toast.error('An error occurred during login')
      },
    })
  }

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true)
    // TODO: Implement Google OAuth
    setTimeout(() => {
      router.push('/menu')
    }, 1000)
  }

  // Register actions
  const handleRegister = (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    registerMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          toast.success('Account created! Please verify your email.')
          router.push('/verify-email')
        },
        onError: () => {
          toast.error('Failed to create account')
        },
      }
    )
  }

  // Password reset actions
  const handleRequestPasswordReset = (data: ResetPasswordRequestForm) => {
    requestResetMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Reset link sent to your email')
      },
      onError: () => {
        toast.error('Failed to send reset link')
      },
    })
  }

  const handleResetPassword = (token: string, data: ResetPasswordForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    resetPasswordMutation.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          toast.success('Password reset successfully!')
          router.push('/reset-password/success')
        },
        onError: () => {
          toast.error('Failed to reset password')
        },
      }
    )
  }

  // Email verification actions
  const handleVerifyEmail = (token: string) => {
    verifyEmailMutation.mutate(
      { token },
      {
        onSuccess: () => {
          toast.success('Email verified successfully!')
          router.push('/verify-email/success')
        },
        onError: () => {
          toast.error('Verification failed')
          router.push('/verify-email/failed')
        },
      }
    )
  }

  const handleResendVerification = (email: string) => {
    resendVerificationMutation.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success('Verification email sent!')
        },
        onError: () => {
          toast.error('Failed to resend verification email')
        },
      }
    )
  }

  // Navigation helpers
  const navigateToLogin = () => router.push('/login')
  const navigateToRegister = () => router.push('/register')
  const navigateToResetPassword = () => router.push('/reset-password')
  const navigateToMenu = () => router.push('/menu')
  const navigateToProfile = () => router.push('/profile')
  const navigateBack = () => router.back()

  return {
    // State
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isResetRequestLoading: requestResetMutation.isPending,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isResendingVerification: resendVerificationMutation.isPending,
    isGoogleLoading,
    
    // Actions
    handleLogin,
    handleGoogleSignIn,
    handleRegister,
    handleRequestPasswordReset,
    handleResetPassword,
    handleVerifyEmail,
    handleResendVerification,
    
    // Navigation
    navigateToLogin,
    navigateToRegister,
    navigateToResetPassword,
    navigateToMenu,
    navigateToProfile,
    navigateBack,
  }
}
