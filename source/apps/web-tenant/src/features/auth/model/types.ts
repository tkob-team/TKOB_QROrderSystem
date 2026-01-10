/**
 * Auth Types
 * 
 * This file should be MINIMAL - only custom types not in generated models.
 * Most types are imported from @/services/generated/models
 */

// Import generated types first
import type {
  LoginDto,
  AuthResponseDto,
  AuthUserResponseDto,
  RegisterSubmitDto,
  RegisterSubmitResponseDto,
  RegisterConfirmDto,
  RefreshTokenDto,
  LogoutDto,
} from '@/services/generated/models';

// Re-export generated types for convenience
export type {
  LoginDto,
  AuthResponseDto,
  AuthUserResponseDto,
  RegisterSubmitDto,
  RegisterSubmitResponseDto,
  RegisterConfirmDto,
  RefreshTokenDto,
  LogoutDto,
} from '@/services/generated/models';

// Custom types not in generated models (if any)
export type UserRole = 'admin' | 'kds' | 'waiter';

// Type aliases for API adapter compatibility
export type LoginCredentials = LoginDto;
export type SignupData = RegisterSubmitDto;
export type ForgotPasswordData = { email: string };
export type ResetPasswordData = { token: string; newPassword: string; confirmPassword: string };
export type VerifyOtpData = { registrationToken: string; otp: string };
export type RegisterConfirmData = RegisterConfirmDto;
export type ResendOtpData = { registrationToken: string };
export type AuthResponse = AuthResponseDto;
export type OtpVerificationResponse = AuthResponseDto;

// Helper type for slug availability (if not in generated models)
export interface SlugAvailabilityResponse {
  available: boolean;
  message?: string;
}
