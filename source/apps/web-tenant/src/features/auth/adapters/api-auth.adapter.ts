// API Auth Adapter - Calls real backend API

import axios from 'axios';
import type { IAuthAdapter } from './auth-adapter.interface';
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
} from '../types/auth.types';

export class ApiAuthAdapter implements IAuthAdapter {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('[ApiAuthAdapter] Login called with:', credentials.email);

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/auth/login`,
        {
          email: credentials.email,
          password: credentials.password,
          deviceInfo: credentials.deviceInfo,
        }
      );

      const { accessToken, user } = response.data;

      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', accessToken);
      }

      return {
        success: true,
        message: 'Login successful',
        token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: this.mapRoleFromBackend(user.role),
          tenantId: user.tenantId,
        },
      };
    } catch (error: unknown) {
      console.error('[ApiAuthAdapter] Login error:', error);

      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Login failed',
        };
      }

      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    console.log('[ApiAuthAdapter] Signup called with:', data);

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

      console.log('[ApiAuthAdapter] Register submit response:', submitResponse.data);
      console.log('[ApiAuthAdapter] Looking for registrationToken:', {
        data: submitResponse.data,
        keys: Object.keys(submitResponse.data || {}),
      });

      // Backend might return it as 'token' or 'registrationToken' or 'data.registrationToken'
      const registrationToken = 
        submitResponse.data?.registrationToken || 
        submitResponse.data?.token ||
        submitResponse.data?.data?.registrationToken;

      console.log('[ApiAuthAdapter] Found registration token:', registrationToken ? 'YES' : 'NO');

      return {
        success: true,
        message: submitResponse.data?.message || 'Check your email for OTP',
        registrationToken,
      };
    } catch (error: unknown) {
      console.error('[ApiAuthAdapter] Signup error:', error);

      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as any;
        const message = errorData?.error?.message || errorData?.message || 'Signup failed';
        
        return {
          success: false,
          message: message,
        };
      }

      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message: string }> {
    console.log('[ApiAuthAdapter] Forgot password called with:', data.email);

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/auth/forgot-password`,
        { email: data.email }
      );

      return {
        success: true,
        message: response.data?.message || 'Reset link sent',
      };
    } catch (error: unknown) {
      console.error('[ApiAuthAdapter] Forgot password error:', error);

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
    console.log('[ApiAuthAdapter] Reset password called');

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/auth/reset-password`,
        {
          token: data.token,
          newPassword: data.newPassword,
        }
      );

      return {
        success: true,
        message: response.data?.message || 'Password reset successful',
      };
    } catch (error: unknown) {
      console.error('[ApiAuthAdapter] Reset password error:', error);

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
    console.log('[ApiAuthAdapter] Verify OTP called with:', {
      registrationToken: data.registrationToken ? data.registrationToken.substring(0, 20) + '...' : 'MISSING',
      otp: data.otp ? '***' : 'MISSING',
    });

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
      const { accessToken, user } = responseData;

      console.log('[ApiAuthAdapter] Response data structure:', {
        hasData: !!response.data?.data,
        hasAccessToken: !!accessToken,
        hasUser: !!user,
      });

      // Store token in localStorage
      if (typeof window !== 'undefined' && accessToken) {
        localStorage.setItem('authToken', accessToken);
      }

      return {
        success: true,
        message: responseData?.message || 'OTP verified',
        verified: true,
        token: accessToken,
        user: user ? {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: this.mapRoleFromBackend(user.role),
          tenantId: user.tenantId,
        } : undefined,
      };
    } catch (error: unknown) {
      console.error('[ApiAuthAdapter] Verify OTP error:', error);

      if (axios.isAxiosError(error) && error.response) {
        console.error('[ApiAuthAdapter] Error response details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });

        return {
          success: false,
          message: error.response.data?.message || 'Verification failed',
          verified: false,
        };
      }

      return {
        success: false,
        message: 'Network error. Please try again.',
        verified: false,
      };
    }
  }

  async resendOtp(data: ResendOtpData): Promise<{ success: boolean; message: string }> {
    console.log('[ApiAuthAdapter] Resend OTP called');

    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/auth/resend-otp`,
        { email: data.email }
      );

      return {
        success: true,
        message: response.data?.message || 'OTP sent',
      };
    } catch (error: unknown) {
      console.error('[ApiAuthAdapter] Resend OTP error:', error);

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
    console.log('[ApiAuthAdapter] Check slug availability:', slug);

    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/auth/check-slug/${slug}`
      );

      return {
        available: response.data?.available || false,
        message: response.data?.message,
      };
    } catch (error: unknown) {
      console.error('[ApiAuthAdapter] Check slug error:', error);

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
    console.log('[ApiAuthAdapter] Logout called');

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
    } catch (error: unknown) {
      console.error('[ApiAuthAdapter] Logout error:', error);
      // Still clear local storage even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  }

  /**
   * Map backend role to frontend role
   */
  private mapRoleFromBackend(backendRole: string): 'admin' | 'kds' | 'waiter' {
    const role = backendRole.toLowerCase();
    
    if (role === 'owner') return 'admin';
    if (role === 'kitchen') return 'kds';
    if (role === 'waiter' || role === 'server') return 'waiter';
    
    return 'admin'; // Default fallback
  }
}
