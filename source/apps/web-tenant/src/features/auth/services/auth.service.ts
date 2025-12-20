// Auth Service - Business logic layer that uses the appropriate adapter

import { config } from '@/lib/config';
import type { IAuthAdapter } from '../adapters/auth-adapter.interface';
import { MockAuthAdapter } from '../adapters/mock-auth.adapter';
import { ApiAuthAdapter } from '../adapters/api-auth.adapter';
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

class AuthService {
  private adapter: IAuthAdapter;

  constructor() {
    // Select adapter based on NEXT_PUBLIC_USE_MOCK_DATA environment variable
    if (config.useMockData) {
      console.log('[AuthService] 🎭 Using MOCK data adapter');
      this.adapter = new MockAuthAdapter();
    } else {
      console.log('[AuthService] 🌐 Using API adapter');
      this.adapter = new ApiAuthAdapter(config.apiUrl);
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('[AuthService] Login request for:', credentials.email);
    return this.adapter.login(credentials);
  }

  /**
   * Sign up new tenant
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    console.log('[AuthService] Signup request for:', data.email);
    
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    return this.adapter.signup(data);
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message: string }> {
    console.log('[AuthService] Forgot password request for:', data.email);
    return this.adapter.forgotPassword(data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    console.log('[AuthService] Reset password request');
    
    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    return this.adapter.resetPassword(data);
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(data: RegisterConfirmData): Promise<OtpVerificationResponse> {
    console.log('[AuthService] Verify OTP request');
    return this.adapter.verifyOtp(data);
  }

  /**
   * Confirm registration with OTP (alias for verifyOtp)
   */
  async registerConfirm(data: RegisterConfirmData): Promise<OtpVerificationResponse> {
    console.log('[AuthService] Register confirm request');
    return this.verifyOtp(data);
  }

  /**
   * Resend OTP code
   */
  async resendOtp(data: ResendOtpData): Promise<{ success: boolean; message: string }> {
    console.log('[AuthService] Resend OTP request');
    return this.adapter.resendOtp(data);
  }

  /**
   * Check if slug is available
   */
  async checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse> {
    console.log('[AuthService] Check slug availability:', slug);
    
    // Validate slug format
    if (!slug || slug.trim() === '') {
      return {
        available: false,
        message: 'Slug cannot be empty',
      };
    }

    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
      return {
        available: false,
        message: 'Slug can only contain lowercase letters, numbers, and hyphens',
      };
    }

    return this.adapter.checkSlugAvailability(slug);
  }

  /**
   * Logout current user
   */
  async logout(refreshToken?: string): Promise<void> {
    console.log('[AuthService] Logout request', { 
      hasRefreshToken: !!refreshToken,
      authTokenExists: !!(typeof window !== 'undefined' && localStorage.getItem('authToken')),
    });
    
    // Helper to get cookie value
    const getCookie = (name: string): string | null => {
      if (typeof window === 'undefined') return null;
      const matches = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return matches ? decodeURIComponent(matches[1]) : null;
    };
    
    // Try multiple sources for refreshToken: parameter -> localStorage -> cookie
    let token = refreshToken;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('refreshToken') || getCookie('refreshToken') || '';
    }
    
    console.log('[AuthService] Using token:', { 
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'EMPTY',
      source: refreshToken ? 'parameter' : localStorage.getItem('refreshToken') ? 'localStorage' : getCookie('refreshToken') ? 'cookie' : 'none',
    });
    
    return this.adapter.logout(token || '');
  }

  /**
   * Get current adapter type (for debugging)
   */
  getAdapterType(): 'mock' | 'api' {
    return config.useMockData ? 'mock' : 'api';
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing purposes
export { AuthService };
