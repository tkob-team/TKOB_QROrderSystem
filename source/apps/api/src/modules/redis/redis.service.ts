import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Redis Service
 *
 * Provides a wrapper around ioredis client with:
 * - JSON serialization/deserialization helpers
 * - Pattern-based key deletion for cache invalidation
 * - Graceful fallback when Redis is unavailable
 * - Connection status monitoring
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private isConnected = true;

  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {
    // Monitor connection status for graceful fallback
    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.error(`Redis connection error: ${err.message}`);
    });
    this.client.on('ready', () => {
      this.isConnected = true;
      this.logger.log('Redis connection ready');
    });
    this.client.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });
  }

  // ==================== Connection Status ====================

  /**
   * Check if Redis is available (for graceful fallback)
   * Returns false if connection is down, allowing callers to fallback to DB
   */
  isAvailable(): boolean {
    return this.isConnected && this.client.status === 'ready';
  }

  // ==================== Basic Operations ====================

  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) {
      this.logger.warn(`Redis unavailable, skipping get for key: ${key}`);
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isAvailable()) {
      this.logger.warn(`Redis unavailable, skipping set for key: ${key}`);
      return;
    }

    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable()) {
      this.logger.warn(`Redis unavailable, skipping del for key: ${key}`);
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to del key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check exists for key ${key}:`, error);
      return false;
    }
  }

  // ==================== JSON Helpers ====================

  /**
   * Set JSON object with optional TTL
   * Automatically serializes object to JSON string
   *
   * @param key - Redis key
   * @param value - Object to serialize and store
   * @param ttlSeconds - Optional TTL in seconds
   */
  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.isAvailable()) {
      this.logger.warn(`Redis unavailable, skipping setJson for key: ${key}`);
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Failed to setJson for key ${key}:`, error);
    }
  }

  /**
   * Get JSON object, returns null if not found or Redis unavailable
   * Automatically deserializes JSON string to object
   *
   * @param key - Redis key
   * @returns Deserialized object or null
   */
  async getJson<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      this.logger.warn(`Redis unavailable, skipping getJson for key: ${key}`);
      return null;
    }

    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Failed to getJson for key ${key}:`, error);
      return null;
    }
  }

  // ==================== Pattern Operations ====================

  /**
   * Delete all keys matching a pattern
   * Useful for cache invalidation (e.g., tenant:*:menu)
   *
   * WARNING: Use with caution on large datasets
   * KEYS command can block Redis on large keyspaces
   *
   * @param pattern - Glob-style pattern (e.g., "tenant:*:menu")
   * @returns Number of keys deleted
   */
  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) {
      this.logger.warn(`Redis unavailable, skipping deleteByPattern: ${pattern}`);
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      const deleted = await this.client.del(...keys);
      this.logger.debug(`Deleted ${deleted} keys matching pattern: ${pattern}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to deleteByPattern ${pattern}:`, error);
      return 0;
    }
  }

  // ==================== Hash Operations ====================

  async hset(key: string, field: string, value: string): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await this.client.hset(key, field, value);
    } catch (error) {
      this.logger.error(`Failed to hset ${key}.${field}:`, error);
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (!this.isAvailable()) return null;

    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(`Failed to hget ${key}.${field}:`, error);
      return null;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.isAvailable()) return {};

    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.error(`Failed to hgetall ${key}:`, error);
      return {};
    }
  }

  // ==================== Utility Operations ====================

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Failed to expire ${key}:`, error);
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Failed to incr ${key}:`, error);
      return 0;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isAvailable()) return -1;

    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get ttl ${key}:`, error);
      return -1;
    }
  }

  /**
   * Get the underlying Redis client for advanced operations
   * Use sparingly - prefer the wrapped methods above
   */
  getClient(): Redis {
    return this.client;
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
