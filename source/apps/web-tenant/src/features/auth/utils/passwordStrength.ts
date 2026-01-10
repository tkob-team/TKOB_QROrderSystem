/**
 * Password Strength Utilities
 * Shared logic for password validation and strength indicators
 */

export interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

/**
 * Get password strength checks
 */
export function getPasswordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };
}

/**
 * Get strength color based on passed checks count
 */
export function getStrengthColor(passedChecks: number): string {
  if (passedChecks <= 1) return 'bg-red-500';
  if (passedChecks <= 2) return 'bg-orange-500';
  if (passedChecks <= 3) return 'bg-amber-500';
  if (passedChecks <= 4) return 'bg-emerald-400';
  return 'bg-emerald-500';
}

/**
 * Get strength text based on passed checks count
 */
export function getStrengthText(passedChecks: number): string {
  if (passedChecks <= 1) return 'Weak';
  if (passedChecks <= 2) return 'Fair';
  if (passedChecks <= 3) return 'Good';
  if (passedChecks <= 4) return 'Strong';
  return 'Very Strong';
}

/**
 * Count how many password checks passed
 */
export function countPassedChecks(checks: PasswordChecks): number {
  return Object.values(checks).filter(Boolean).length;
}
