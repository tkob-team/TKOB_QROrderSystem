/**
 * Auth Controller Hook - Public API
 * Wraps internal query hooks to provide clean public interface for UI
 * Handles orchestration logic so pages can stay thin
 */

import { useState, useCallback, useRef } from 'react';
import {
  useLogin,
  useRegisterSubmit,
  useRegisterConfirm,
  useRefreshToken,
  useLogout,
  useLogoutAll,
  useCurrentUser,
} from './queries';
import { authAdapter } from '../data/factory';

export type UseAuthControllerReturn = {
  // Mutations (wrapped for consistent API)
  loginMutation: ReturnType<typeof useLogin>;
  registerSubmitMutation: ReturnType<typeof useRegisterSubmit>;
  registerConfirmMutation: ReturnType<typeof useRegisterConfirm>;
  refreshTokenMutation: ReturnType<typeof useRefreshToken>;
  logoutMutation: ReturnType<typeof useLogout>;
  logoutAllMutation: ReturnType<typeof useLogoutAll>;
  
  // Queries
  currentUserQuery: ReturnType<typeof useCurrentUser>;
  
  // Direct adapter access (for legacy pages that call methods directly)
  adapter: typeof authAdapter;
  
  // Convenience methods (delegate to mutations)
  login: (credentials: any) => void;
  registerSubmit: (data: any) => void;
  registerConfirm: (data: any) => void;
  refreshToken: (token: string) => void;
  logout: (refreshToken: string) => void;
  logoutAll: () => void;
  
  // Orchestration methods (async handlers with state management)
  checkSlugAvailability: (slug: string) => Promise<{ available: boolean; message?: string } | null>;
  isCheckingSlug: boolean;
  
  verifyOtp: (params: { registrationToken: string; otp: string }) => Promise<{ success: boolean; accessToken?: string; message?: string }>;
  isVerifyingOtp: boolean;
  verifyOtpError: string | null;
  
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  isResendingOtp: boolean;
  resendOtpError: string | null;
  resendCooldown: number;
  
  sendForgotPasswordLink: (email: string) => Promise<{ success: boolean; message?: string }>;
  isSendingResetLink: boolean;
  
  resetPassword: (params: { token: string; newPassword: string }) => Promise<{ success: boolean; message?: string }>;
  isResettingPassword: boolean;
  resetPasswordError: string | null;
};

/**
 * Main controller hook for auth operations
 * UI components should use this instead of importing query hooks directly
 */
export const useAuthController = (options?: { enabledCurrentUser?: boolean }): UseAuthControllerReturn => {
  const loginMutation = useLogin();
  const registerSubmitMutation = useRegisterSubmit();
  const registerConfirmMutation = useRegisterConfirm();
  const refreshTokenMutation = useRefreshToken();
  const logoutMutation = useLogout();
  const logoutAllMutation = useLogoutAll();
  const currentUserQuery = useCurrentUser({ enabled: options?.enabledCurrentUser });

  // Orchestration state
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [verifyOtpError, setVerifyOtpError] = useState<string | null>(null);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendOtpError, setResendOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup cooldown timer on unmount
  useState(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  });

  // Orchestration: Check slug availability
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug) return null;
    
    setIsCheckingSlug(true);
    try {
      const result = await authAdapter.checkSlugAvailability(slug);
      return result;
    } catch (error) {
      console.error('[useAuthController] Check slug error:', error);
      return { available: false, message: 'Failed to check availability' };
    } finally {
      setIsCheckingSlug(false);
    }
  }, []);

  // Orchestration: Verify OTP
  const verifyOtp = useCallback(async (params: { registrationToken: string; otp: string }) => {
    setIsVerifyingOtp(true);
    setVerifyOtpError(null);
    
    try {
      const result = await authAdapter.verifyOtp(params);
      
      if (result.accessToken) {
        return { success: true, accessToken: result.accessToken };
      } else {
        const error = 'Verification failed. Please try again.';
        setVerifyOtpError(error);
        return { success: false, message: error };
      }
    } catch (err) {
      console.error('[useAuthController] Verify OTP error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setVerifyOtpError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsVerifyingOtp(false);
    }
  }, []);

  // Orchestration: Resend OTP
  const resendOtp = useCallback(async (email: string) => {
    if (resendCooldown > 0) {
      return { success: false, message: 'Please wait before resending' };
    }
    
    setIsResendingOtp(true);
    setResendOtpError(null);
    
    try {
      const result = await authAdapter.resendOtp({ email });
      
      if (result.success) {
        // Start cooldown
        setResendCooldown(60);
        if (cooldownTimerRef.current) {
          clearInterval(cooldownTimerRef.current);
        }
        cooldownTimerRef.current = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              if (cooldownTimerRef.current) {
                clearInterval(cooldownTimerRef.current);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return { success: true, message: result.message };
      } else {
        const error = result.message || 'Failed to resend code';
        setResendOtpError(error);
        return { success: false, message: error };
      }
    } catch (err) {
      console.error('[useAuthController] Resend OTP error:', err);
      const errorMessage = 'Failed to resend code. Please try again.';
      setResendOtpError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsResendingOtp(false);
    }
  }, [resendCooldown]);

  // Orchestration: Send forgot password link
  const sendForgotPasswordLink = useCallback(async (email: string) => {
    setIsSendingResetLink(true);
    
    try {
      const result = await authAdapter.forgotPassword({ email });
      return result;
    } catch (error) {
      console.error('[useAuthController] Forgot password error:', error);
      return { success: false, message: 'Failed to send reset link. Please try again.' };
    } finally {
      setIsSendingResetLink(false);
    }
  }, []);

  // Orchestration: Reset password
  const resetPassword = useCallback(async (params: { token: string; newPassword: string }) => {
    setIsResettingPassword(true);
    setResetPasswordError(null);
    
    try {
      const result = await authAdapter.resetPassword({
        token: params.token,
        newPassword: params.newPassword,
      });
      if (result.success) {
        setIsResettingPassword(false);
      }
      return result;
    } catch (err) {
      console.error('[useAuthController] Reset password error:', err);
      const errorMessage = 'Something went wrong. Please try again.';
      setResetPasswordError(errorMessage);
      setIsResettingPassword(false);
      return { success: false, message: errorMessage };
    }
  }, []);

  return {
    // Raw mutations/queries (for advanced use)
    loginMutation,
    registerSubmitMutation,
    registerConfirmMutation,
    refreshTokenMutation,
    logoutMutation,
    logoutAllMutation,
    currentUserQuery,
    
    // Direct adapter access (for pages using direct calls)
    adapter: authAdapter,
    
    // Convenience methods (most common usage)
    login: (credentials: any) => loginMutation.mutate(credentials),
    registerSubmit: (data: any) => registerSubmitMutation.mutate(data),
    registerConfirm: (data: any) => registerConfirmMutation.mutate(data),
    refreshToken: (token: string) => refreshTokenMutation.mutate(token),
    logout: (refreshToken: string) => logoutMutation.mutate(refreshToken),
    logoutAll: () => logoutAllMutation.mutate(),
    
    // Orchestration methods
    checkSlugAvailability,
    isCheckingSlug,
    verifyOtp,
    isVerifyingOtp,
    verifyOtpError,
    resendOtp,
    isResendingOtp,
    resendOtpError,
    resendCooldown,
    sendForgotPasswordLink,
    isSendingResetLink,
    resetPassword,
    isResettingPassword,
    resetPasswordError,
  };
};
