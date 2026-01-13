// API Auth Adapter - Calls real backend API

import axios from 'axios';
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

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    logger.info('[auth] LOGIN_ATTEMPT');

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/auth/login`,
        {
          email: credentials.email,
          password: credentials.password,
          deviceInfo: credentials.deviceInfo,
        }
      );

      const { accessToken, refreshToken, expiresIn, user, tenant } = response.data;

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
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] LOGIN_ERROR', { code: axios.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Login failed');
      }

      throw new Error('Network error. Please try again.');
    }
  }

  async signup(data: SignupData): Promise<RegisterSubmitResponseDto> {
    logger.info('[auth] SIGNUP_ATTEMPT');

    try {
      // Step 1: Submit registration data and get OTP
      const submitResponse = await axios.post(
        `${this.apiUrl}/api/v1/auth/register/submit`,
        {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          tenantName: data.tenantName, // Send restaurant name as tenantName
          slug: data.slug,
        }
      );

      logger.debug('[auth] SIGNUP_SUBMIT_RESPONSE_RECEIVED', { hasRegistrationToken: !!submitResponse.data?.registrationToken });

      // Backend should return registrationToken, message, and expiresIn
      const { registrationToken, message, expiresIn } = submitResponse.data;

      logger.info('[auth] SIGNUP_OTP_SENT');

      return {
        registrationToken,
        message: message || 'Check your email for OTP',
        expiresIn,
      };
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] SIGNUP_ERROR', { code: axios.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (axios.isAxiosError(error) && error.response) {
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
      const response = await axios.post(
        `${this.apiUrl}/api/v1/auth/forgot-password`,
        { email: data.email }
      );

      logger.info('[auth] FORGOT_PASSWORD_EMAIL_SENT');

      return {
        success: true,
        message: response.data?.message || 'Reset link sent',
      };
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] FORGOT_PASSWORD_ERROR', { code: axios.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (axios.isAxiosError(error) && error.response) {
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
      const response = await axios.post(
        `${this.apiUrl}/api/v1/auth/reset-password`,
        {
          token: data.token,
          newPassword: data.newPassword,
        }
      );

      logger.info('[auth] RESET_PASSWORD_SUCCESS');

      return {
        success: true,
        message: response.data?.message || 'Password reset successful',
      };
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] RESET_PASSWORD_ERROR', { code: axios.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (axios.isAxiosError(error) && error.response) {
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

  async verifyOtp(data: RegisterConfirmData): Promise<OtpVerificationResponse> {
    logger.debug('[auth] VERIFY_OTP_ATTEMPT');

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/auth/register/confirm`,
        {
          registrationToken: data.registrationToken,
          otp: data.otp,
        }
      );

      // Backend wraps response in { success: true, data: {...} }
      const responseData = response.data?.data || response.data;
      const { accessToken, refreshToken, expiresIn, user, tenant } = responseData;

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
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] VERIFY_OTP_ERROR', { code: axios.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Verification failed');
      }

      throw new Error('Network error. Please try again.');
    }
  }

  async resendOtp(data: { email: string }): Promise<{ success: boolean; message: string }> {
    logger.info('[auth] RESEND_OTP_ATTEMPT');

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/auth/resend-otp`,
        { email: data.email }
      );

      logger.info('[auth] RESEND_OTP_SUCCESS');

      return {
        success: true,
        message: response.data?.message || 'OTP sent',
      };
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] RESEND_OTP_ERROR', { code: axios.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (axios.isAxiosError(error) && error.response) {
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

    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/auth/check-slug/${slug}`
      );

      logger.debug('[auth] CHECK_SLUG_RESULT', { available: response.data?.available });

      return {
        available: response.data?.available || false,
        message: response.data?.message,
      };
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.error('[auth] CHECK_SLUG_ERROR', { code: axios.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });

      if (axios.isAxiosError(error) && error.response) {
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
        await axios.post(
          `${this.apiUrl}/api/v1/auth/logout`,
          { refreshToken }
        );
      }

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }

      logger.info('[auth] LOGOUT_SUCCESS');
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : String(error);
      logger.warn('[auth] LOGOUT_ERROR', { code: axios.isAxiosError(error) ? error.response?.status : 'NETWORK', message: errorMessage });
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
   * @todo Implement actual API call
   */
  async refreshToken(data: { refreshToken: string }): Promise<AuthResponse> {
    // TODO: Implement refresh token API call
    throw new Error('RefreshToken not yet implemented');
  }

  /**
   * Logout from all devices
   * @todo Implement actual API call
   */
  async logoutAll(): Promise<void> {
    // TODO: Implement logout all devices API call
    throw new Error('LogoutAll not yet implemented');
  }

  async getCurrentUser(): Promise<any> {
    // TODO: Implement get current user API call
    throw new Error('GetCurrentUser not yet implemented');
  }
}
