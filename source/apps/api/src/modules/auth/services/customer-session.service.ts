import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TokenService } from './token.service';
import { RedisService } from '../../redis/redis.service';
import * as bcrypt from 'bcrypt';

/**
 * Customer session data stored in Redis
 */
export interface CustomerSessionData {
  customerId: string;
  email: string;
  deviceInfo: string;
  sessionId: string;
  createdAt: string;
}

export interface CustomerTokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Customer Session Service
 * Manages customer login sessions (separate from tenant user sessions)
 */
@Injectable()
export class CustomerSessionService {
  private readonly logger = new Logger(CustomerSessionService.name);
  private readonly SALT_ROUNDS = 10;
  private readonly SESSION_KEY_PREFIX = 'customer-session';

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly redis: RedisService,
  ) {}

  // ==================== Redis Session Methods ====================

  private buildSessionKey(customerId: string, sessionId: string): string {
    return `${this.SESSION_KEY_PREFIX}:${customerId}:${sessionId}`;
  }

  private async storeSessionInRedis(
    sessionId: string,
    data: Omit<CustomerSessionData, 'sessionId'>,
  ): Promise<void> {
    const key = this.buildSessionKey(data.customerId, sessionId);
    const ttl = this.tokenService.getRefreshTokenExpirySeconds();

    const sessionData: CustomerSessionData = {
      ...data,
      sessionId,
    };

    await this.redis.setJson(key, sessionData, ttl);
    this.logger.debug(`Customer session stored in Redis: ${key}`);
  }

  async getSessionFromRedis(
    customerId: string,
    sessionId: string,
  ): Promise<CustomerSessionData | null> {
    const key = this.buildSessionKey(customerId, sessionId);
    return this.redis.getJson<CustomerSessionData>(key);
  }

  private async deleteSessionFromRedis(customerId: string, sessionId: string): Promise<void> {
    const key = this.buildSessionKey(customerId, sessionId);
    await this.redis.del(key);
  }

  private async deleteAllSessionsFromRedis(customerId: string): Promise<void> {
    await this.redis.deleteByPattern(`${this.SESSION_KEY_PREFIX}:${customerId}:*`);
  }

  // ==================== Session Management ====================

  /**
   * Create session and generate tokens for customer
   */
  async createSessionWithTokens(
    customerId: string,
    deviceInfo?: string,
  ): Promise<CustomerTokenPair> {
    // Get customer info for token payload
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, email: true, fullName: true },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    // Generate tokens with customer-specific payload
    // For customers: we use a simplified token without role/tenantId
    const accessToken = this.tokenService.generateAccessToken(
      customer.id,
      customer.email,
      'CUSTOMER', // pseudo-role for identification
      'NONE', // no tenant
    );
    const refreshToken = this.tokenService.generateRefreshToken(customer.id);

    // Hash refresh token for storage
    const refreshTokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.tokenService.getRefreshTokenExpirySeconds());

    // Create session in database
    const session = await this.prisma.customerSession.create({
      data: {
        customerId,
        refreshTokenHash,
        deviceInfo: deviceInfo || 'Unknown',
        expiresAt,
      },
    });

    // Store in Redis for fast lookup
    await this.storeSessionInRedis(session.id, {
      customerId: customer.id,
      email: customer.email,
      deviceInfo: deviceInfo || 'Unknown',
      createdAt: new Date().toISOString(),
    });

    this.logger.log(`Created customer session: ${session.id} for ${customer.email}`);

    return { accessToken, refreshToken };
  }

  /**
   * Validate refresh token and return new token pair
   */
  async refreshTokens(customerId: string, refreshToken: string): Promise<CustomerTokenPair> {
    // Find valid sessions for customer
    const sessions = await this.prisma.customerSession.findMany({
      where: {
        customerId,
        expiresAt: { gt: new Date() },
      },
    });

    // Find matching session
    let validSession: typeof sessions[0] | null = null;
    for (const session of sessions) {
      const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (isValid) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Get customer for new tokens
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    // Generate new tokens
    const newAccessToken = this.tokenService.generateAccessToken(
      customer.id,
      customer.email,
      'CUSTOMER',
      'NONE',
    );
    const newRefreshToken = this.tokenService.generateRefreshToken(customer.id);

    // Update session with new refresh token
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, this.SALT_ROUNDS);
    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(
      newExpiresAt.getSeconds() + this.tokenService.getRefreshTokenExpirySeconds(),
    );

    await this.prisma.customerSession.update({
      where: { id: validSession.id },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
        lastUsedAt: new Date(),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Revoke specific session
   */
  async revokeSession(customerId: string, refreshToken: string): Promise<void> {
    const sessions = await this.prisma.customerSession.findMany({
      where: { customerId },
    });

    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (isMatch) {
        await this.prisma.customerSession.delete({ where: { id: session.id } });
        await this.deleteSessionFromRedis(customerId, session.id);
        this.logger.log(`Revoked customer session: ${session.id}`);
        return;
      }
    }
  }

  /**
   * Revoke all sessions for customer
   */
  async revokeAllSessions(customerId: string): Promise<void> {
    await this.prisma.customerSession.deleteMany({ where: { customerId } });
    await this.deleteAllSessionsFromRedis(customerId);
    this.logger.log(`Revoked all sessions for customer: ${customerId}`);
  }

  /**
   * Get active sessions for customer
   */
  async getActiveSessions(customerId: string) {
    return this.prisma.customerSession.findMany({
      where: {
        customerId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceInfo: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }
}
