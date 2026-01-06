/**
 * Auth Types
 * 
 * This file should be MINIMAL - only custom types not in generated models.
 * Most types are imported from @/services/generated/models
 */

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

// Helper type for slug availability (if not in generated models)
export interface SlugAvailabilityResponse {
  available: boolean;
  message?: string;
}
