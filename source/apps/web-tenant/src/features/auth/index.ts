/**
 * Auth Feature - Public API
 * 
 * Exports canonical structure:
 * - Pages from ui/pages/
 * - Shared components from ui/components/
 * - Controller hook from hooks/
 * - Types from model/
 * 
 * BOUNDARY: Does NOT export internal data/ or hooks/queries/
 */

// UI - Pages
export { Login } from './ui/pages/LoginPage';
export { Signup } from './ui/pages/SignupPage';
export { ForgotPassword } from './ui/pages/ForgotPasswordPage';
export { ResetPassword } from './ui/pages/ResetPasswordPage';
export { EmailVerification } from './ui/pages/EmailVerificationPage';
export { OnboardingWizard } from './ui/pages/OnboardingWizardPage';
export { StaffInvitationSignup } from './ui/pages/StaffInvitationSignupPage';

// Hooks - Public Controller Only
export { useAuthController } from './hooks';
export type { UseAuthControllerReturn } from './hooks/useAuthController';

// Model - Types (re-export what actually exists)
export type {
  // Generated types
  LoginDto,
  AuthResponseDto,
  AuthUserResponseDto,
  RegisterSubmitDto,
  RegisterSubmitResponseDto,
  RegisterConfirmDto,
  RefreshTokenDto,
  LogoutDto,
  
  // Custom types
  UserRole,
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
} from './model';
