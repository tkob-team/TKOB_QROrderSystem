import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TokenService } from './token.service';
import { RedisService } from '../../redis/redis.service';
import { TokenPair, CreateSessionData } from '../interfaces/registration-data.interface';
import * as bcrypt from 'bcrypt';

/**
 * Session data stored in Redis for fast validation
 */
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  deviceInfo: string;
  sessionId: string;
  createdAt: string;
}

/**
 * Session Service
 * Responsibilities:
 * - Create user sessions
 * - Validate sessions
 * - Delete sessions (logout)
 * - Manage refresh tokens in database
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly SALT_ROUNDS = 10;
  private readonly SESSION_KEY_PREFIX = 'session';

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly redis: RedisService,
  ) {}

  // ==================== Redis Session Methods ====================

  /**
   * Build Redis key for session
   * Format: session:{userId}:{sessionId}
   */
  private buildSessionKey(userId: string, sessionId: string): string {
    return `${this.SESSION_KEY_PREFIX}:${userId}:${sessionId}`;
  }

  /**
   * Store session metadata in Redis for fast validation
   * This is called alongside PostgreSQL storage for dual-write
   */
  private async storeSessionInRedis(
    sessionId: string,
    data: Omit<SessionData, 'sessionId'>,
  ): Promise<void> {
    const key = this.buildSessionKey(data.userId, sessionId);
    const ttl = this.tokenService.getRefreshTokenExpirySeconds();

    const sessionData: SessionData = {
      ...data,
      sessionId,
    };

    await this.redis.setJson(key, sessionData, ttl);
    this.logger.debug(`Session stored in Redis: ${key}`);
  }

  /**
   * Get session from Redis (fast path for validation)
   * Returns null if not found or Redis unavailable (triggers DB fallback)
   */
  async getSessionFromRedis(userId: string, sessionId: string): Promise<SessionData | null> {
    const key = this.buildSessionKey(userId, sessionId);
    return this.redis.getJson<SessionData>(key);
  }

  /**
   * Delete session from Redis (logout)
   */
  private async deleteSessionFromRedis(userId: string, sessionId: string): Promise<void> {
    const key = this.buildSessionKey(userId, sessionId);
    await this.redis.del(key);
    this.logger.debug(`Session deleted from Redis: ${key}`);
  }

  /**
   * Delete all sessions for user from Redis
   */
  private async deleteAllSessionsFromRedis(userId: string): Promise<void> {
    const deletedCount = await this.redis.deleteByPattern(`${this.SESSION_KEY_PREFIX}:${userId}:*`);
    this.logger.debug(`Deleted ${deletedCount} sessions from Redis for user: ${userId}`);
  }

  /**
   * Create a new session for user
   * @param data - Session creation data
   * @returns Token pair (access + refresh)
   */
  async createSession(data: CreateSessionData): Promise<TokenPair> {
    const { userId, deviceInfo, refreshToken } = data;

    // Hash refresh token before storing
    const refreshTokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);

    // Calculate expiry date
    const expirySeconds = this.tokenService.getRefreshTokenExpirySeconds();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expirySeconds);

    // Store session in database
    await this.prisma.userSession.create({
      data: {
        userId,
        refreshTokenHash,
        deviceInfo: deviceInfo || 'Unknown',
        expiresAt,
      },
    });

    this.logger.log(`Session created for user: ${userId}`);

    return {
      accessToken: data.refreshToken, // Will be replaced by caller
      refreshToken,
      sessionId: (await this.prisma.userSession.findFirst({
        where: { userId, refreshTokenHash },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      }))?.id || '',
    };
  }

  /**
   * Create session and generate tokens for a user
   * @param userId - User ID
   * @param deviceInfo - Device information
   * @returns Token pair
   */
  async createSessionWithTokens(userId: string, deviceInfo?: string): Promise<TokenPair> {
    // Fetch user to get email, role, tenantId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair(
      user.id,
      user.email,
      user.role,
      user.tenantId,
    );

    // Create session in PostgreSQL (source of truth)
    const session = await this.createSession({
      userId,
      deviceInfo,
      refreshToken: tokens.refreshToken,
    });

    // Also store session metadata in Redis for fast lookup
    // This enables O(1) session validation instead of DB queries
    if (session.sessionId) {
      await this.storeSessionInRedis(session.sessionId, {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        deviceInfo: deviceInfo || 'Unknown',
        createdAt: new Date().toISOString(),
      });
    }

    return tokens;
  }

  /**
   * Validate refresh token and return session
   * @param userId - User ID
   * @param refreshToken - Refresh token to validate
   * @returns Session if valid
   * @throws UnauthorizedException if invalid
   */
  async validateRefreshToken(userId: string, refreshToken: string) {
    // Get all active sessions for user
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (sessions.length === 0) {
      throw new UnauthorizedException('No active session found');
    }

    // Check if refresh token matches any session
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (isMatch) {
        // Update last used time
        await this.prisma.userSession.update({
          where: { id: session.id },
          data: { lastUsedAt: new Date() },
        });

        return session;
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  /**
   * Delete session (logout)
   * @param userId - User ID
   * @param refreshToken - Refresh token to revoke
   */
  async deleteSession(userId: string, refreshToken: string): Promise<void> {
    // Find session by hashed token
    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
    });

    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (isMatch) {
        // Delete from PostgreSQL
        await this.prisma.userSession.delete({
          where: { id: session.id },
        });

        // Also delete from Redis for immediate session invalidation
        await this.deleteSessionFromRedis(userId, session.id);

        this.logger.log(`Session deleted for user: ${userId}`);
        return;
      }
    }

    this.logger.warn(`Session not found for logout: ${userId}`);
  }

  /**
   * Delete all sessions for a user (logout from all devices)
   * @param userId - User ID
   */
  async deleteAllSessions(userId: string): Promise<void> {
    // Delete from PostgreSQL
    const result = await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    // Also delete all sessions from Redis
    await this.deleteAllSessionsFromRedis(userId);

    this.logger.log(`Deleted ${result.count} sessions for user: ${userId}`);
  }

  /**
   * Get all active sessions for a user
   * @param userId - User ID
   * @returns Array of sessions
   */
  async getUserSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        expiresAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        deviceInfo: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });
  }

  /**
   * Clean up expired sessions (run as cron job)
   */
  async cleanupExpiredSessions(): Promise<void> {
    const result = await this.prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired sessions`);
  }
}
