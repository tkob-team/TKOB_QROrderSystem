import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

/**
 * Menu Cache Service
 *
 * Implements Cache-Aside (Lazy Loading) pattern for menu caching:
 * - Read: Check cache → If miss, return null (caller fetches from DB)
 * - Write: Never update cache directly, only INVALIDATE (delete)
 *
 * WHY DELETE instead of UPDATE:
 * 1. Simpler logic - avoid complex cache sync issues
 * 2. Next read will fetch fresh data automatically
 * 3. Prevents "stale cache" bugs if update fails mid-way
 *
 * Key Strategy: tenant:{tenantId}:menu
 * TTL: 1 hour (3600 seconds)
 */
@Injectable()
export class MenuCacheService {
  private readonly logger = new Logger(MenuCacheService.name);

  // Cache configuration
  private readonly CACHE_TTL_SECONDS = 3600; // 1 hour
  private readonly KEY_PREFIX = 'tenant';

  constructor(private readonly redis: RedisService) {}

  /**
   * Build cache key for tenant menu
   * Format: tenant:{tenantId}:menu
   *
   * @param tenantId - Tenant ID
   * @returns Cache key string
   */
  private buildKey(tenantId: string): string {
    return `${this.KEY_PREFIX}:${tenantId}:menu`;
  }

  /**
   * Get cached menu for tenant
   * Returns null if not cached or Redis unavailable (triggers DB fallback)
   *
   * @param tenantId - Tenant ID
   * @returns Cached menu data or null
   */
  async getMenu<T>(tenantId: string): Promise<T | null> {
    const key = this.buildKey(tenantId);
    const cached = await this.redis.getJson<T>(key);

    if (cached) {
      this.logger.debug(`Cache HIT for tenant menu: ${tenantId}`);
    } else {
      this.logger.debug(`Cache MISS for tenant menu: ${tenantId}`);
    }

    return cached;
  }

  /**
   * Cache menu response with TTL
   *
   * @param tenantId - Tenant ID
   * @param menuData - Menu data to cache
   */
  async setMenu<T>(tenantId: string, menuData: T): Promise<void> {
    const key = this.buildKey(tenantId);
    await this.redis.setJson(key, menuData, this.CACHE_TTL_SECONDS);
    this.logger.debug(`Cached menu for tenant: ${tenantId} (TTL: ${this.CACHE_TTL_SECONDS}s)`);
  }

  /**
   * Invalidate (delete) cache for a specific tenant
   * Called when menu items are created/updated/deleted
   *
   * This is the core of Cache-Aside pattern's write path:
   * Instead of updating cache, we simply delete it.
   * The next read will automatically fetch fresh data from DB.
   *
   * @param tenantId - Tenant ID
   */
  async invalidate(tenantId: string): Promise<void> {
    const key = this.buildKey(tenantId);
    await this.redis.del(key);
    this.logger.log(`Invalidated menu cache for tenant: ${tenantId}`);
  }

  /**
   * Invalidate all menu caches
   * Use for admin operations that affect multiple tenants
   *
   * WARNING: This uses KEYS command which can be slow on large datasets
   */
  async invalidateAll(): Promise<void> {
    const deletedCount = await this.redis.deleteByPattern(`${this.KEY_PREFIX}:*:menu`);
    this.logger.log(`Invalidated ${deletedCount} menu caches`);
  }

  /**
   * Check if menu is cached for a tenant
   *
   * @param tenantId - Tenant ID
   * @returns true if cached
   */
  async isCached(tenantId: string): Promise<boolean> {
    const key = this.buildKey(tenantId);
    return this.redis.exists(key);
  }

  /**
   * Get remaining TTL for cached menu
   *
   * @param tenantId - Tenant ID
   * @returns TTL in seconds, -1 if not found, -2 if no TTL set
   */
  async getTTL(tenantId: string): Promise<number> {
    const key = this.buildKey(tenantId);
    return this.redis.ttl(key);
  }
}
