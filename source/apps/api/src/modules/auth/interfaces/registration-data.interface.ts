/**
 * Data structure stored in Redis during registration flow
 * TTL: 10 minutes (600 seconds)
 */
export interface RegistrationData {
  email: string;
  passwordHash: string;
  fullName: string;
  tenantName: string;
  slug: string;
  otp: string;
}

/**
 * JWT payload structure for access tokens
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  tenantId: string;
  iat?: number; // issued at
  exp?: number; // expiration
}

/**
 * JWT payload for refresh tokens (minimal data)
 */
export interface RefreshTokenPayload {
  sub: string; // userId
  iat?: number;
  exp?: number;
}

/**
 * Session creation data
 */
export interface CreateSessionData {
  userId: string;
  deviceInfo?: string;
  refreshToken: string;
}

/**
 * Token pair returned to client
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionId?: string; // Session ID for Redis tracking
}
