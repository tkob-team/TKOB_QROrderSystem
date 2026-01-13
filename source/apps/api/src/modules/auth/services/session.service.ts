import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TokenService } from './token.service';
import { TokenPair, CreateSessionData } from '../interfaces/registration-data.interface';
import * as bcrypt from 'bcrypt';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

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

    // Create session
    await this.createSession({
      userId,
      deviceInfo,
      refreshToken: tokens.refreshToken,
    });

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
        await this.prisma.userSession.delete({
          where: { id: session.id },
        });

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
    const result = await this.prisma.userSession.deleteMany({
      where: { userId },
    });

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
