import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { Redis } from 'ioredis';

describe('RedisService', () => {
  let service: RedisService;
  let redisClient: jest.Mocked<Redis>;

  beforeEach(async () => {
    const redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      keys: jest.fn(),
      hset: jest.fn(),
      hget: jest.fn(),
      hgetall: jest.fn(),
      expire: jest.fn(),
      incr: jest.fn(),
      ttl: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(),
      status: 'ready',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService, { provide: 'REDIS_CLIENT', useValue: redisMock }],
    }).compile();

    service = module.get<RedisService>(RedisService);
    redisClient = module.get('REDIS_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isAvailable', () => {
    it('should return true when Redis is connected and ready', () => {
      expect(service.isAvailable()).toBe(true);
    });
  });

  describe('get', () => {
    it('should return value for existing key', async () => {
      redisClient.get.mockResolvedValue('test-value');

      const result = await service.get('test-key');

      expect(redisClient.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
    });

    it('should return null for non-existing key', async () => {
      redisClient.get.mockResolvedValue(null);

      const result = await service.get('non-existing');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      await service.set('key', 'value');

      expect(redisClient.set).toHaveBeenCalledWith('key', 'value');
    });

    it('should set value with TTL using setex', async () => {
      await service.set('key', 'value', 3600);

      expect(redisClient.setex).toHaveBeenCalledWith('key', 3600, 'value');
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      await service.del('key-to-delete');

      expect(redisClient.del).toHaveBeenCalledWith('key-to-delete');
    });
  });

  describe('exists', () => {
    it('should return true if key exists', async () => {
      redisClient.exists.mockResolvedValue(1);

      const result = await service.exists('existing-key');

      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      redisClient.exists.mockResolvedValue(0);

      const result = await service.exists('non-existing-key');

      expect(result).toBe(false);
    });
  });

  describe('setJson', () => {
    it('should serialize and store JSON object', async () => {
      const data = { name: 'test', value: 123 };

      await service.setJson('json-key', data);

      expect(redisClient.set).toHaveBeenCalledWith('json-key', JSON.stringify(data));
    });

    it('should serialize and store JSON object with TTL', async () => {
      const data = { name: 'test' };

      await service.setJson('json-key', data, 600);

      expect(redisClient.setex).toHaveBeenCalledWith('json-key', 600, JSON.stringify(data));
    });
  });

  describe('getJson', () => {
    it('should deserialize stored JSON', async () => {
      const data = { name: 'test', value: 123 };
      redisClient.get.mockResolvedValue(JSON.stringify(data));

      const result = await service.getJson('json-key');

      expect(result).toEqual(data);
    });

    it('should return null for non-existing key', async () => {
      redisClient.get.mockResolvedValue(null);

      const result = await service.getJson('non-existing');

      expect(result).toBeNull();
    });
  });

  describe('deleteByPattern', () => {
    it('should delete all keys matching pattern', async () => {
      redisClient.keys.mockResolvedValue(['key:1', 'key:2', 'key:3']);
      redisClient.del.mockResolvedValue(3);

      const result = await service.deleteByPattern('key:*');

      expect(redisClient.keys).toHaveBeenCalledWith('key:*');
      expect(redisClient.del).toHaveBeenCalledWith('key:1', 'key:2', 'key:3');
      expect(result).toBe(3);
    });

    it('should return 0 if no keys match pattern', async () => {
      redisClient.keys.mockResolvedValue([]);

      const result = await service.deleteByPattern('no-match:*');

      expect(result).toBe(0);
    });
  });

  describe('hash operations', () => {
    it('should set hash field', async () => {
      await service.hset('hash-key', 'field', 'value');

      expect(redisClient.hset).toHaveBeenCalledWith('hash-key', 'field', 'value');
    });

    it('should get hash field', async () => {
      redisClient.hget.mockResolvedValue('field-value');

      const result = await service.hget('hash-key', 'field');

      expect(result).toBe('field-value');
    });

    it('should get all hash fields', async () => {
      const hashData = { field1: 'value1', field2: 'value2' };
      redisClient.hgetall.mockResolvedValue(hashData);

      const result = await service.hgetall('hash-key');

      expect(result).toEqual(hashData);
    });
  });

  describe('utility operations', () => {
    it('should set expiry on key', async () => {
      await service.expire('key', 300);

      expect(redisClient.expire).toHaveBeenCalledWith('key', 300);
    });

    it('should increment key', async () => {
      redisClient.incr.mockResolvedValue(5);

      const result = await service.incr('counter');

      expect(result).toBe(5);
    });

    it('should get TTL of key', async () => {
      redisClient.ttl.mockResolvedValue(120);

      const result = await service.ttl('key-with-ttl');

      expect(result).toBe(120);
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect Redis client', () => {
      service.onModuleDestroy();

      expect(redisClient.disconnect).toHaveBeenCalled();
    });
  });
});
