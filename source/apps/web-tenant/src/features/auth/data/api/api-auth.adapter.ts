// API Auth Adapter - Calls real backend API

import { customInstance } from '@/services/axios';
// Import axios for AxiosError type only (not for HTTP calls)
import type { AxiosError } from 'axios';
import { logger } from '@/shared/utils/logger';
import type { IAuthAdapter } from '../adapter.interface';
import type {
  LoginCredentials,
  SignupData,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyOtpData,
  RegisterConfirmData,
  ResendOtpData,
  AuthResponse,
  OtpVerificationResponse,
  SlugAvailabilityResponse,
} from '@/features/auth/model';
import { AuthUserResponseDtoRole, RegisterSubmitResponseDto } from '@/services/generated/models';

export class ApiAuthAdapter implements IAuthAdapter {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Type guard to check if error is an AxiosError
   */
  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as any).isAxiosError === true
    );
  }

  /**
   * Helper method to handle and extract error information from axios errors
   */
  private handleError(error: unknown, context: string, defaultMessage: string): never {
    const errorMessage = this.isAxiosError(error) 
      ? error.response?.data?.message || error.message 
      : String(error);
    
    logger.error(`[auth] ${context}_ERROR`, { 
      code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', 
      message: errorMessage 
    });

    if (this.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || defaultMessage);
    }

    throw new Error('Network error. Please try again.');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    logger.info('[auth] LOGIN_ATTEMPT');

    try {
      const response = await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/login`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          email: credentials.email,
          password: credentials.password,
          deviceInfo: credentials.deviceInfo,
        },
      });

      // customInstance already unwraps { success, data } to just return data
      // So response is directly the auth data, not response.data.data
      const { accessToken, refreshToken, expiresIn, user, tenant } = response;

      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', accessToken);
      }

      logger.info('[auth] LOGIN_SUCCESS', { role: user?.role, tenantId: user?.tenantId });

      return {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: this.mapRoleFromBackend(user.role),
          tenantId: user.tenantId,
        },
        tenant,
      };
    } catch (error: unknown) {
      this.handleError(error, 'LOGIN', 'Login failed');
    }
  }

  async signup(data: SignupData): Promise<RegisterSubmitResponseDto> {
    logger.info('[auth] SIGNUP_ATTEMPT');

    try {
      // Step 1: Submit registration data and get OTP
      const submitResponse = await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/register/submit`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          tenantName: data.tenantName, // Send restaurant name as tenantName
          slug: data.slug,
        },
      });

      // customInstance already unwraps { success, data } to just return data
      logger.debug('[auth] SIGNUP_SUBMIT_RESPONSE_RECEIVED', { hasRegistrationToken: !!submitResponse?.registrationToken });

      // Backend should return registrationToken, message, and expiresIn
      const { registrationToken, message, expiresIn } = submitResponse;

      logger.info('[auth] SIGNUP_OTP_SENT');

      return {
        registrationToken,
        message: message || 'Check your email for OTP',
        expiresIn,
      };
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] SIGNUP_ERROR', { code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (this.isAxiosError(error) && error.response) {
        const errorData = error.response.data as any;
        const message = errorData?.error?.message || errorData?.message || 'Signup failed';
        
        throw new Error(message);
      }

      throw new Error('Network error. Please try again.');
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message: string }> {
    logger.info('[auth] FORGOT_PASSWORD_ATTEMPT');

    try {
      const response = await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/forgot-password`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { email: data.email },
      });

      logger.info('[auth] FORGOT_PASSWORD_EMAIL_SENT');

      return {
        success: true,
        message: response?.message || 'Reset link sent',
      };
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] FORGOT_PASSWORD_ERROR', { code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (this.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Request failed',
        };
      }

      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    logger.info('[auth] RESET_PASSWORD_ATTEMPT');

    try {
      const response = await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/reset-password`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          token: data.token,
          newPassword: data.newPassword,
        },
      });

      logger.info('[auth] RESET_PASSWORD_SUCCESS');

      return {
        success: true,
        message: response?.message || 'Password reset successful',
      };
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] RESET_PASSWORD_ERROR', { code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (this.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Reset failed',
        };
      }

      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string; code?: string }> {
    logger.info('[auth] VERIFY_RESET_TOKEN_ATTEMPT');

    try {
      const response = await customInstance<any>({
        url: this.apiUrl + '/api/v1/auth/verify-reset-token',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { token },
      });

      logger.info('[auth] VERIFY_RESET_TOKEN_SUCCESS', { valid: response?.valid });

      return {
        valid: response?.valid || false,
        email: response?.email,
      };
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] VERIFY_RESET_TOKEN_ERROR', { code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      // Return invalid if API fails
      return {
        valid: false,
      };
    }
  }

  async verifyOtp(data: RegisterConfirmData): Promise<OtpVerificationResponse> {
    logger.debug('[auth] VERIFY_OTP_ATTEMPT');

    try {
      const response = await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/register/confirm`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          registrationToken: data.registrationToken,
          otp: data.otp,
        },
      });

      // customInstance already unwraps { success: true, data: {...} } to just return data
      const { accessToken, refreshToken, expiresIn, user, tenant } = response;

      logger.debug('[auth] VERIFY_OTP_RESPONSE_RECEIVED', { hasAccessToken: !!accessToken, hasUser: !!user });

      // Store token in localStorage
      if (typeof window !== 'undefined' && accessToken) {
        localStorage.setItem('authToken', accessToken);
      }

      logger.info('[auth] VERIFY_OTP_SUCCESS', { role: user?.role, tenantId: user?.tenantId });

      return {
        accessToken,
        refreshToken,
        expiresIn,
        user: user ? {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: this.mapRoleFromBackend(user.role),
          tenantId: user.tenantId,
        } : undefined,
        tenant,
      };
    } catch (error: unknown) {
      this.handleError(error, 'VERIFY_OTP', 'Verification failed');
    }
  }

  async resendOtp(data: { email: string }): Promise<{ success: boolean; message: string }> {
    logger.info('[auth] RESEND_OTP_ATTEMPT');

    try {
      const response = await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/resend-otp`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { email: data.email },
      });

      logger.info('[auth] RESEND_OTP_SUCCESS');

      return {
        success: true,
        message: response?.message || 'OTP sent',
      };
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] RESEND_OTP_ERROR', { code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (this.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Failed to send OTP',
        };
      }

      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse> {
    logger.debug('[auth] CHECK_SLUG_ATTEMPT', { slug });

    try{
      const response = await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/check-slug/${slug}`,
        method: 'GET',
      });

      // customInstance already unwraps { success, data } to just return data
      logger.debug('[auth] CHECK_SLUG_RESULT', { available: response?.available });

      return {
        available: response?.available || false,
        message: response?.message,
      };
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] CHECK_SLUG_ERROR', { code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (this.isAxiosError(error) && error.response) {
        return {
          available: false,
          message: error.response.data?.message || 'Check failed',
        };
      }

      return {
        available: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async logout(refreshToken?: string): Promise<void> {
    logger.info('[auth] LOGOUT_ATTEMPT');

    try {
      if (refreshToken) {
        await customInstance<any>({
          url: `${this.apiUrl}/api/v1/auth/logout`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: { refreshToken },
        });
      }

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }

      logger.info('[auth] LOGOUT_SUCCESS');
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.warn('[auth] LOGOUT_ERROR', { code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });
      // Still clear local storage even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  }

  /**
   * Map backend role to frontend role
   */
  private mapRoleFromBackend(backendRole: string): AuthUserResponseDtoRole {
    const role = backendRole.toLowerCase();
    
    if (role === 'owner') return AuthUserResponseDtoRole.OWNER;
    if (role === 'kitchen') return AuthUserResponseDtoRole.KITCHEN;
    if (role === 'waiter' || role === 'server' || role === 'staff') return AuthUserResponseDtoRole.STAFF;
    
    return AuthUserResponseDtoRole.OWNER; // Default fallback
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: { refreshToken: string }): Promise<AuthResponse> {
    logger.info('[auth] REFRESH_TOKEN_ATTEMPT');

    try {
      const response = await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/refresh`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { refreshToken: data.refreshToken },
      });

      // customInstance already unwraps { success, data } to just return data
      const { accessToken, refreshToken, expiresIn } = response;

      // Update token in localStorage
      if (typeof window !== 'undefined' && accessToken) {
        localStorage.setItem('authToken', accessToken);
      }

      logger.info('[auth] REFRESH_TOKEN_SUCCESS');

      return {
        accessToken,
        refreshToken,
        expiresIn,
        // User and tenant not returned in refresh response
        user: undefined,
        tenant: undefined,
      };
    } catch (error: unknown) {
      this.handleError(error, 'REFRESH_TOKEN', 'Token refresh failed');
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    logger.info('[auth] LOGOUT_ALL_ATTEMPT');

    try {
      await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/logout-all`,
        method: 'POST',
      });

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }

      logger.info('[auth] LOGOUT_ALL_SUCCESS');
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.warn('[auth] LOGOUT_ALL_ERROR', { 
        code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', 
        message: errorMessage 
      });

      // Still clear local storage even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }

      throw new Error('Failed to logout from all devices');
    }
  }

  async getCurrentUser(): Promise<any> {
    logger.info('[auth] GET_CURRENT_USER_ATTEMPT');

    try {
      const response = await customInstance<any>({
        url: `${this.apiUrl}/api/v1/auth/me`,
        method: 'GET',
      });

      // customInstance already unwraps { success, data } to just return data
      const { user, tenant } = response;

      logger.info('[auth] GET_CURRENT_USER_SUCCESS', { 
        userId: user?.id, 
        role: user?.role 
      });

      return {
        user: user ? {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: this.mapRoleFromBackend(user.role),
          tenantId: user.tenantId,
        } : null,
        tenant,
      };
    } catch (error: unknown) {
      this.handleError(error, 'GET_CURRENT_USER', 'Failed to get user');
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }> {
    logger.debug('[auth] CHANGE_PASSWORD_ATTEMPT');

    try {
      await customInstance({
        url: `${this.apiUrl}/api/v1/auth/change-password`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      });

      logger.info('[auth] CHANGE_PASSWORD_SUCCESS');
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] CHANGE_PASSWORD_ERROR', { 
        code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', 
        message: errorMessage 
      });
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }

  /**
   * Update user profile (fullName)
   */
  async updateProfile(data: { fullName: string }): Promise<{ success: boolean; message?: string; user?: any }> {
    logger.debug('[auth] UPDATE_PROFILE_ATTEMPT');

    try {
      const response = await customInstance({
        url: `${this.apiUrl}/api/v1/auth/me`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fullName: data.fullName,
        },
      });

      logger.info('[auth] UPDATE_PROFILE_SUCCESS');
      
      // Handle both wrapped (data.data) and unwrapped (data) responses
      const userData = response.data?.data?.user || response.data?.user;
      
      return { 
        success: true,
        user: userData 
      };
    } catch (error: unknown) {
      const errorMessage = this.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] UPDATE_PROFILE_ERROR', { 
        code: this.isAxiosError(error) ? error.response?.status : 'NETWORK', 
        message: errorMessage 
      });
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }
}
