// Mock Auth Adapter - Returns mock data for development

import type { IAuthAdapter } from './auth-adapter.interface';
import type {
  LoginDto,
  AuthResponseDto,
  RegisterSubmitDto,
  RegisterSubmitResponseDto,
  RegisterConfirmDto,
  RefreshTokenDto,
  AuthUserResponseDto,
  AuthUserResponseDtoRole,
} from '@/services/generated/models';
import type { SlugAvailabilityResponse } from '../model/auth.types';

export class MockAuthAdapter implements IAuthAdapter {
  private readonly MOCK_DELAY = 1000; // Simulate network delay

  private delay(ms: number = this.MOCK_DELAY): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    console.log('[MockAuthAdapter] Login called with:', credentials.email);
    await this.delay();

    // Accept any email/password for mock
    // Check for specific test accounts
    if (credentials.email === 'error@test.com') {
      throw new Error('Invalid credentials');
    }

    // Determine role based on email
    let role: AuthUserResponseDtoRole = 'OWNER';
    if (credentials.email.includes('kds') || credentials.email.includes('kitchen')) {
      role = 'KITCHEN';
    } else if (credentials.email.includes('waiter') || credentials.email.includes('server')) {
      role = 'STAFF';
    }

    return {
      accessToken: `mock-token-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      expiresIn: 3600,
      user: {
        id: `mock-user-${role}`,
        email: credentials.email,
        fullName: `Mock ${role} User`,
        role,
        tenantId: 'mock-tenant-001',
      },
    };
  }

  async signup(data: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    console.log('[MockAuthAdapter] Signup called with:', data);
    await this.delay();

    // Validate mock data
    if (data.email === 'existing@test.com') {
      throw new Error('Email already exists');
    }

    return {
      registrationToken: `mock-token-${Date.now()}`,
      message: 'Registration successful. Please check your email for OTP.',
    };
  }

  async forgotPassword(data: { email: string }): Promise<{ success: boolean; message: string }> {
    console.log('[MockAuthAdapter] Forgot password called with:', data.email);
    await this.delay();

    if (data.email === 'notfound@test.com') {
      throw new Error('Email not found');
    }

    return {
      success: true,
      message: 'Password reset link sent to your email',
    };
  }

  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    console.log('[MockAuthAdapter] Reset password called');
    await this.delay();

    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    if (data.token === 'expired') {
      return {
        success: false,
        message: 'Reset token has expired',
      };
    }

    return {
      success: true,
      message: 'Password reset successful',
    };
  }

  async verifyOtp(data: RegisterConfirmDto): Promise<AuthResponseDto> {
    console.log('[MockAuthAdapter] Verify OTP called with registrationToken');
    await this.delay(1500);

    // Accept 123456 as valid OTP
    if (data.otp === '123456') {
      return {
        accessToken: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        expiresIn: 3600,
        user: {
          id: 'mock-user-admin',
          email: 'admin@test.com',
          fullName: 'Mock Admin User',
          role: 'OWNER',
          tenantId: 'mock-tenant-001',
        },
      };
    }

    throw new Error('Invalid OTP code');
  }

  async resendOtp(data: { email: string }): Promise<{ success: boolean; message: string }> {
    console.log('[MockAuthAdapter] Resend OTP called with:', data.email);
    await this.delay();

    return {
      success: true,
      message: 'OTP code sent successfully',
    };
  }

  async checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse> {
    console.log('[MockAuthAdapter] Check slug availability:', slug);
    await this.delay(500);

    // Mock reserved slugs
    const reservedSlugs = ['admin', 'api', 'dashboard', 'login', 'signup', 'test-restaurant'];

    if (reservedSlugs.includes(slug.toLowerCase())) {
      return {
        available: false,
        message: 'This slug is already taken or reserved',
      };
    }

    return {
      available: true,
      message: 'Slug is available',
    };
  }

  async logout(_refreshToken?: string): Promise<void> {
    console.log('[MockAuthAdapter] Logout called');
    await this.delay(300);
    // Mock logout - no actual operation needed
  }

  async refreshToken(data: RefreshTokenDto): Promise<AuthResponseDto> {
    console.log('[MockAuthAdapter] Refresh token called');
    await this.delay(500);
    
    // Mock refresh - return new tokens
    return {
      accessToken: `mock-new-access-token-${Date.now()}`,
      refreshToken: `mock-new-refresh-token-${Date.now()}`,
      expiresIn: 3600,
      user: {
        id: 'mock-user-id',
        email: 'admin@tkqr.com',
        fullName: 'Mock Admin User',
        role: 'OWNER',
        tenantId: 'mock-tenant-id',
      },
    };
  }

  async logoutAll(): Promise<void> {
    console.log('[MockAuthAdapter] Logout all devices called');
    await this.delay(400);
    // Mock logout all - no actual operation needed
  }

  async getCurrentUser(): Promise<AuthUserResponseDto> {
    console.log('[MockAuthAdapter] Get current user called');
    await this.delay(300);
    
    // Mock current user - return generated DTO format
    return {
      id: 'mock-user-id',
      email: 'admin@tkqr.com',
      fullName: 'Mock Admin User',
      role: 'OWNER',
      tenantId: 'mock-tenant-id',
    };
  }
}
