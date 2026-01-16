import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config/env.validation';
import {
  JwtPayload as CustomJwtPayload,
  RefreshTokenPayload,
  TokenPair,
} from '../interfaces/registration-data.interface';

/**
 * Token Service
 * Responsibilities:
 * - Generate JWT access tokens
 * - Generate JWT refresh tokens
 * - Verify JWT tokens
 * - Extract payload from tokens
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {}

  /**
   * Generate access token (short-lived)
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @param tenantId - Tenant ID
   * @returns JWT access token
   */
  generateAccessToken(userId: string, email: string, role: string, tenantId: string): string {
    const payload: CustomJwtPayload = {
      sub: userId,
      email,
      role,
      tenantId,
    };

    const expiresIn = this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', {
      infer: true,
    }) as string;

    const token = this.jwt.sign(payload as any, { expiresIn } as JwtSignOptions);

    this.logger.debug(`Access token generated for user: ${userId}`);
    return token;
  }

  /**
   * Generate refresh token (long-lived)
   * @param userId - User ID
   * @returns JWT refresh token
   */
  generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = {
      sub: userId,
    };

    const expiresIn = this.config.get('JWT_REFRESH_TOKEN_EXPIRES_IN', {
      infer: true,
    }) as string;

    const token = this.jwt.sign(payload as any, { expiresIn } as JwtSignOptions);

    this.logger.debug(`Refresh token generated for user: ${userId}`);
    return token;
  }

  /**
   * Generate both access and refresh tokens
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @param tenantId - Tenant ID
   * @returns Token pair
   */
  generateTokenPair(userId: string, email: string, role: string, tenantId: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(userId, email, role, tenantId),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  /**
   * Verify and decode JWT token
   * @param token - JWT token
   * @returns Decoded payload
   * @throws UnauthorizedException if invalid
   */
  verifyToken<T = any>(token: string): T {
    try {
      return this.jwt.verify(token) as T;
    } catch (error) {
      this.logger.warn(`Token verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Decode token without verification (use carefully!)
   * @param token - JWT token
   * @returns Decoded payload or null
   */
  decodeToken<T = any>(token: string): T | null {
    return this.jwt.decode(token);
  }

  /**
   * Get access token expiry time in seconds
   */
  getAccessTokenExpirySeconds(): number {
    const expiresIn = this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true });
    // Convert "1h" to seconds, "7d" to seconds, etc.
    return this.parseExpiryToSeconds(expiresIn);
  }

  /**
   * Get refresh token expiry time in seconds
   */
  getRefreshTokenExpirySeconds(): number {
    const expiresIn = this.config.get('JWT_REFRESH_TOKEN_EXPIRES_IN', { infer: true });
    return this.parseExpiryToSeconds(expiresIn);
  }

  /**
   * Parse expiry string to seconds
   * @param expiry - Expiry string (e.g., "1h", "7d")
   * @returns Seconds
   */
  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }
}
