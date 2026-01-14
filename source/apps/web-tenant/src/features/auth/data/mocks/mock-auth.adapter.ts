// Mock Auth Adapter - Returns mock data for development

import { logger } from '@/shared/utils/logger';
import type { IAuthAdapter } from '../adapter.interface';
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
import type { SlugAvailabilityResponse } from '../../model';

export class MockAuthAdapter implements IAuthAdapter {
  private readonly MOCK_DELAY = 1000; // Simulate network delay

  private delay(ms: number = this.MOCK_DELAY): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    logger.debug('[auth:mock] LOGIN_ATTEMPT');
    await this.delay();

    // Accept any email/password for mock
    // Check for specific test accounts
    if (credentials.email === 'error@test.com') {
      logger.warn('[auth:mock] LOGIN_FAIL', { reason: 'test error account' });
      throw new Error('Invalid credentials');
    }

    // Determine role based on email
    let role: AuthUserResponseDtoRole = 'OWNER';
    if (credentials.email.includes('kds') || credentials.email.includes('kitchen')) {
      role = 'KITCHEN';
    } else if (credentials.email.includes('waiter') || credentials.email.includes('server')) {
      role = 'STAFF';
    }

    logger.debug('[auth:mock] LOGIN_SUCCESS', { role, tenantId: 'mock-tenant-001' });

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
    logger.debug('[auth:mock] SIGNUP_ATTEMPT');
    await this.delay();

    // Validate mock data
    if (data.email === 'existing@test.com') {
      logger.warn('[auth:mock] SIGNUP_FAIL', { reason: 'email already exists' });
      throw new Error('Email already exists');
    }

    logger.debug('[auth:mock] SIGNUP_SUCCESS');

    return {
      registrationToken: `mock-token-${Date.now()}`,
      message: 'Registration successful. Please check your email for OTP.',
      expiresIn: 3600,
    };
  }

  async forgotPassword(data: { email: string }): Promise<{ success: boolean; message: string }> {
    logger.debug('[auth:mock] FORGOT_PASSWORD_ATTEMPT');
    await this.delay();

    if (data.email === 'notfound@test.com') {
      logger.warn('[auth:mock] FORGOT_PASSWORD_FAIL', { reason: 'email not found' });
      throw new Error('Email not found');
    }

    logger.debug('[auth:mock] FORGOT_PASSWORD_SUCCESS');

    return {
      success: true,
      message: 'Password reset link sent to your email',
    };
  }

  async resetPassword(data: { token: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    logger.debug('[auth:mock] RESET_PASSWORD_ATTEMPT');
    await this.delay();

    if (data.token === 'expired') {
      logger.warn('[auth:mock] RESET_PASSWORD_FAIL', { reason: 'token expired' });
      return {
        success: false,
        message: 'Reset token has expired',
      };
    }

    logger.debug('[auth:mock] RESET_PASSWORD_SUCCESS');

    return {
      success: true,
      message: 'Password reset successful',
    };
  }

  async verifyOtp(data: RegisterConfirmDto): Promise<AuthResponseDto> {
    logger.debug('[auth:mock] VERIFY_OTP_ATTEMPT');
    await this.delay(1500);

    // Accept 123456 as valid OTP
    if (data.otp === '123456') {
      logger.debug('[auth:mock] VERIFY_OTP_SUCCESS', { role: 'OWNER', tenantId: 'mock-tenant-001' });
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

    logger.warn('[auth:mock] VERIFY_OTP_FAIL', { reason: 'invalid otp code' });
    throw new Error('Invalid OTP code');
  }

  async resendOtp(data: { email: string }): Promise<{ success: boolean; message: string }> {
    logger.debug('[auth:mock] RESEND_OTP_ATTEMPT');
    await this.delay();

    logger.debug('[auth:mock] RESEND_OTP_SUCCESS');
    return {
      success: true,
      message: 'OTP code sent successfully',
    };
  }

  async checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse> {
    logger.debug('[auth:mock] CHECK_SLUG_ATTEMPT', { slug });
    await this.delay(500);

    // Mock reserved slugs
    const reservedSlugs = ['admin', 'api', 'dashboard', 'login', 'signup', 'test-restaurant'];

    if (reservedSlugs.includes(slug.toLowerCase())) {
      logger.debug('[auth:mock] CHECK_SLUG_RESULT', { available: false, reason: 'reserved' });
      return {
        available: false,
        message: 'This slug is already taken or reserved',
      };
    }

    logger.debug('[auth:mock] CHECK_SLUG_RESULT', { available: true });
    return {
      available: true,
      message: 'Slug is available',
    };
  }

  async logout(_refreshToken?: string): Promise<void> {
    logger.debug('[auth:mock] LOGOUT_ATTEMPT');
    await this.delay(300);
    // Mock logout - no actual operation needed
    logger.debug('[auth:mock] LOGOUT_SUCCESS');
  }

  async refreshToken(data: RefreshTokenDto): Promise<AuthResponseDto> {
    logger.debug('[auth:mock] REFRESH_TOKEN_ATTEMPT');
    await this.delay(500);
    
    // Mock refresh - return new tokens
    logger.debug('[auth:mock] REFRESH_TOKEN_SUCCESS');
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
    logger.debug('[auth:mock] LOGOUT_ALL_ATTEMPT');
    await this.delay(400);
    // Mock logout all - no actual operation needed
    logger.debug('[auth:mock] LOGOUT_ALL_SUCCESS');
  }

  async getCurrentUser(): Promise<AuthUserResponseDto> {
    logger.debug('[auth:mock] GET_CURRENT_USER_ATTEMPT');
    await this.delay(300);
    
    // Mock current user - return generated DTO format
    logger.debug('[auth:mock] GET_CURRENT_USER_SUCCESS');
    return {
      id: 'mock-user-id',
      email: 'admin@tkqr.com',
      fullName: 'Mock Admin User',
      role: 'OWNER',
      tenantId: 'mock-tenant-id',
    };
  }
}
