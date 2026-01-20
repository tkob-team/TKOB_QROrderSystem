import { Test, TestingModule } from '@nestjs/testing';
import { MenuCacheService } from './menu-cache.service';
import { RedisService } from '../../redis/redis.service';

describe('MenuCacheService', () => {
  let service: MenuCacheService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const redisMock: Partial<jest.Mocked<RedisService>> = {
      getJson: jest.fn(),
      setJson: jest.fn(),
      del: jest.fn(),
      deleteByPattern: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuCacheService,
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<MenuCacheService>(MenuCacheService);
    redisService = module.get<RedisService>(RedisService) as jest.Mocked<RedisService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMenu', () => {
    it('should return cached menu data if exists', async () => {
      const menuData = { categories: [], items: [] };
      redisService.getJson.mockResolvedValue(menuData);

      const result = await service.getMenu('tenant-123');

      expect(redisService.getJson).toHaveBeenCalledWith('tenant:tenant-123:menu');
      expect(result).toEqual(menuData);
    });

    it('should return null if cache miss', async () => {
      redisService.getJson.mockResolvedValue(null);

      const result = await service.getMenu('tenant-123');

      expect(result).toBeNull();
    });
  });

  describe('setMenu', () => {
    it('should cache menu with TTL', async () => {
      const menuData = { categories: [], items: [] };

      await service.setMenu('tenant-123', menuData);

      expect(redisService.setJson).toHaveBeenCalledWith(
        'tenant:tenant-123:menu',
        menuData,
        3600, // CACHE_TTL_SECONDS
      );
    });
  });

  describe('invalidate', () => {
    it('should delete cache for specific tenant', async () => {
      await service.invalidate('tenant-123');

      expect(redisService.del).toHaveBeenCalledWith('tenant:tenant-123:menu');
    });
  });

  describe('invalidateAll', () => {
    it('should delete all menu caches using pattern', async () => {
      redisService.deleteByPattern.mockResolvedValue(5);

      await service.invalidateAll();

      expect(redisService.deleteByPattern).toHaveBeenCalledWith('tenant:*:menu');
    });
  });

  describe('isCached', () => {
    it('should return true if cache exists', async () => {
      redisService.exists.mockResolvedValue(true);

      const result = await service.isCached('tenant-123');

      expect(result).toBe(true);
    });

    it('should return false if cache does not exist', async () => {
      redisService.exists.mockResolvedValue(false);

      const result = await service.isCached('tenant-123');

      expect(result).toBe(false);
    });
  });

  describe('getTTL', () => {
    it('should return remaining TTL for cached menu', async () => {
      redisService.ttl.mockResolvedValue(1800);

      const result = await service.getTTL('tenant-123');

      expect(redisService.ttl).toHaveBeenCalledWith('tenant:tenant-123:menu');
      expect(result).toBe(1800);
    });
  });
});
