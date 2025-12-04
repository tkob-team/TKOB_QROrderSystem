/**
 * Centralized Redis key patterns
 * Using template literals for type safety and consistency
 */
export class RedisKeys {
  /**
   * Registration data during signup flow
   * Format: reg:{registrationToken}
   * TTL: 10 minutes
   */
  static registration(token: string): string {
    return `reg:${token}`;
  }

  /**
   * OTP for email verification
   * Format: otp:{email}
   * TTL: 5 minutes
   */
  static otp(email: string): string {
    return `otp:${email}`;
  }

  /**
   * Session data (optional, if you want to cache)
   * Format: session:{sessionId}
   */
  static session(sessionId: string): string {
    return `session:${sessionId}`;
  }

  /**
   * Rate limiting key
   * Format: ratelimit:{identifier}
   */
  static rateLimit(identifier: string): string {
    return `ratelimit:${identifier}`;
  }

  /**
   * Menu cache per tenant
   * Format: menu:{tenantId}
   */
  static menu(tenantId: string): string {
    return `menu:${tenantId}`;
  }
}
