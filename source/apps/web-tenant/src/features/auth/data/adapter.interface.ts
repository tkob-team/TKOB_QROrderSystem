// Auth Adapter Interface - Contract for both Mock and API implementations

import type {
  LoginDto,
  AuthResponseDto,
  RegisterSubmitDto,
  RegisterSubmitResponseDto,
  RegisterConfirmDto,
  RefreshTokenDto,
  AuthUserResponseDto,
} from '@/services/generated/models';
import type { SlugAvailabilityResponse } from '../model';

export interface IAuthAdapter {
  /**
   * Login with email and password
   */
  login(credentials: LoginDto): Promise<AuthResponseDto>;

  /**
   * Sign up new tenant
   */
  signup(data: RegisterSubmitDto): Promise<RegisterSubmitResponseDto>;

  /**
   * Request password reset
   */
  forgotPassword(data: { email: string }): Promise<{ success: boolean; message: string }>;

  /**
   * Reset password with token
   */
  resetPassword(data: { token: string; newPassword: string }): Promise<{ success: boolean; message: string }>;

  /**
   * Verify OTP code
   */
  verifyOtp(data: RegisterConfirmDto): Promise<AuthResponseDto>;

  /**
   * Resend OTP code
   */
  resendOtp(data: { email: string }): Promise<{ success: boolean; message: string }>;

  /**
   * Check slug availability
   */
  checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse>;

  /**
   * Logout current user
   */
  logout(refreshToken?: string): Promise<void>;

  /**
   * Logout from all devices
   */
  logoutAll(): Promise<void>;

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<AuthUserResponseDto>;

  /**
   * Refresh access token
   */
  refreshToken(data: RefreshTokenDto): Promise<AuthResponseDto>;
}
