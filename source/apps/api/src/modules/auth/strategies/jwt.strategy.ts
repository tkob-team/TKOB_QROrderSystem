import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/env.validation';
import { PrismaService } from '../../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

/**
 * JWT Strategy with Redis-backed validation optimization
 *
 * Optimization Flow:
 * 1. Fast path: Check Redis for cached user status
 *    - If ACTIVE, skip DB query entirely (O(1) lookup)
 *    - If cached as inactive/not-found, reject immediately
 * 2. Slow path: Query DB and cache result for future requests
 *
 * This reduces DB load significantly for authenticated requests
 * while maintaining security through short cache TTL.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  // Cache TTL configuration
  private readonly ACTIVE_USER_CACHE_TTL = 300; // 5 minutes for active users
  private readonly INACTIVE_USER_CACHE_TTL = 60; // 1 minute for inactive (quick recovery)
  private readonly USER_STATUS_KEY_PREFIX = 'user:status';

  constructor(
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
    });
  }

  /**
   * Build cache key for user status
   * Format: user:status:{userId}
   */
  private buildStatusCacheKey(userId: string): string {
    return `${this.USER_STATUS_KEY_PREFIX}:${userId}`;
  }

  async validate(payload: JwtPayload) {
    const userId = payload.sub;
    const cacheKey = this.buildStatusCacheKey(userId);

    // 1. Fast path: Check Redis for cached user status
    const cachedStatus = await this.redis.get(cacheKey);

    if (cachedStatus === 'ACTIVE') {
      // User is known to be active, skip DB query
      this.logger.debug(`User status cache HIT (ACTIVE): ${userId}`);
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      };
    }

    if (cachedStatus && cachedStatus !== 'ACTIVE') {
      // User is cached as inactive - reject immediately
      this.logger.debug(`User status cache HIT (${cachedStatus}): ${userId}`);
      throw new UnauthorizedException('User not found or inactive');
    }

    // 2. Slow path: Cache miss - query DB
    this.logger.debug(`User status cache MISS, querying DB: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (!user) {
      // Cache negative result with short TTL
      await this.redis.set(cacheKey, 'NOT_FOUND', this.INACTIVE_USER_CACHE_TTL);
      throw new UnauthorizedException('User not found or inactive');
    }

    if (user.status !== 'ACTIVE') {
      // Cache inactive status with short TTL
      await this.redis.set(cacheKey, user.status, this.INACTIVE_USER_CACHE_TTL);
      throw new UnauthorizedException('User not found or inactive');
    }

    // Cache positive result with longer TTL
    await this.redis.set(cacheKey, 'ACTIVE', this.ACTIVE_USER_CACHE_TTL);

    // Return user data to be attached to request object
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
