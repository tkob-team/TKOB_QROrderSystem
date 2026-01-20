"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLogin } from './queries/useLogin'
import { useRegister } from './queries/useRegister'
import { useRegisterConfirm } from './queries/useRegisterConfirm'
import { useLogout } from './queries/useLogout'
import { useRequestPasswordReset } from './queries/useRequestPasswordReset'
import { useResetPassword } from './queries/useResetPassword'
import { useVerifyEmail } from './queries/useVerifyEmail'
import { useResendVerification } from './queries/useResendVerification'
import type { LoginForm, RegisterForm, ResetPasswordRequestForm, ResetPasswordForm } from '../model'

// Store registration token temporarily for OTP flow
let pendingRegistrationToken: string | null = null
let pendingRegistrationEmail: string | null = null

export function useAuthController() {
  const router = useRouter()
  
  const loginMutation = useLogin()
  const logoutMutation = useLogout()
  const registerMutation = useRegister()
  const registerConfirmMutation = useRegisterConfirm()
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



  // Register actions
  const handleRegister = (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    registerMutation.mutate(
      { 
        data: { 
          email: data.email, 
          password: data.password,
          fullName: data.email.split('@')[0], // use email prefix as name
          slug: `customer-${Date.now()}`,
          tenantName: 'Customer Account',
        } 
      },
      {
        onSuccess: (response) => {
          // Store registration token for OTP confirmation step
          pendingRegistrationToken = response.registrationToken
          pendingRegistrationEmail = data.email
          toast.success('OTP sent to your email!')
          router.push('/verify-email')
        },
        onError: () => {
          toast.error('Failed to create account')
        },
      }
    )
  }

  // OTP confirmation after registration
  const handleConfirmOTP = (otp: string) => {
    if (!pendingRegistrationToken) {
      toast.error('Registration session expired. Please register again.')
      router.push('/register')
      return
    }

    registerConfirmMutation.mutate(
      {
        data: {
          registrationToken: pendingRegistrationToken,
          otp,
        }
      },
      {
        onSuccess: (response) => {
          // Clear pending data
          pendingRegistrationToken = null
          pendingRegistrationEmail = null
          
          // Store tokens
          if (typeof window !== 'undefined' && response.accessToken) {
            localStorage.setItem('token', response.accessToken)
          }
          
          toast.success('Account verified successfully!')
          router.push('/menu')
        },
        onError: () => {
          toast.error('Invalid OTP code. Please try again.')
        },
      }
    )
  }

  // Get pending registration email for display
  const getPendingEmail = () => pendingRegistrationEmail

  // Password reset actions
  const handleRequestPasswordReset = (data: ResetPasswordRequestForm) => {
    requestResetMutation.mutate({ data: { email: data.email } }, {
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
      { data: { token, newPassword: data.password } },
      {
        onSuccess: () => {
          toast.success('Password reset successfully!')
          router.push('/reset-password/success')
        },
        onError: (error: any) => {
          // Show specific error message
          const message = error?.response?.data?.error?.message || error?.message || 'Failed to reset password'
          if (message.includes('invalid') || message.includes('expired')) {
            toast.error('Reset link is invalid or expired. Please request a new one.')
          } else {
            toast.error(message)
          }
        },
      }
    )
  }

  // Email verification actions
  const handleVerifyEmail = (token: string) => {
    verifyEmailMutation.mutate(
      { data: { token } },
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
      { data: { email } },
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

  // Logout action
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Logged out successfully')
        // Clear any local storage if needed
        router.push('/login')
      },
      onError: () => {
        toast.error('Failed to logout')
      },
    })
  }

  // Google OAuth
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint with state=customer
    // This tells the backend to create a Customer (not a User/Tenant)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    window.location.href = `${apiUrl}/api/v1/auth/google?state=customer`
  }

  // Navigation helpers
  const navigateToHome = () => router.push('/')
  const navigateToLogin = () => router.push('/login')
  const navigateToRegister = () => router.push('/register')
  const navigateToResetPassword = () => router.push('/reset-password')
  const navigateToMenu = () => router.push('/menu')
  const navigateToProfile = () => router.push('/profile')
  const navigateBack = () => router.push('/scan-qr') // Go to scan-qr instead of router.back() to avoid redirect loops

  return {
    // State
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isConfirmOTPLoading: registerConfirmMutation.isPending,
    isResetRequestLoading: requestResetMutation.isPending,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isResendingVerification: resendVerificationMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    
    // Actions
    handleLogin,
    handleGoogleLogin,
    handleLogout,
    handleRegister,
    handleConfirmOTP,
    getPendingEmail,
    handleRequestPasswordReset,
    handleResetPassword,
    handleVerifyEmail,
    handleResendVerification,
    
    // Navigation
    navigateToHome,
    navigateToLogin,
    navigateToRegister,
    navigateToResetPassword,
    navigateToMenu,
    navigateToProfile,
    navigateBack,
  }
}
