import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let redisService: jest.Mocked<RedisService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const redisMock: Partial<jest.Mocked<RedisService>> = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const configMock: Partial<jest.Mocked<ConfigService>> = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'FALLBACK_USD_VND_RATE') return 25000;
        if (key === 'EXCHANGE_RATE_API_KEY') return null; // No API key for testing
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        { provide: RedisService, useValue: redisMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
    redisService = module.get<RedisService>(RedisService) as jest.Mocked<RedisService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFallbackRate', () => {
    it('should return configured fallback rate', () => {
      const rate = service.getFallbackRate();
      expect(rate).toBe(25000);
    });
  });

  describe('getExchangeRate', () => {
    it('should return cached rate if available', async () => {
      const cachedData = {
        from: 'USD',
        to: 'VND',
        rate: 24500,
        timestamp: new Date().toISOString(),
      };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getExchangeRate('USD', 'VND');

      expect(redisService.get).toHaveBeenCalledWith('currency:exchange_rates:USD:VND');
      expect(result.rate).toBe(24500);
    });

    it('should use fallback rate when API key is not configured', async () => {
      redisService.get.mockResolvedValue(null);

      const result = await service.getExchangeRate('USD', 'VND');

      expect(result.rate).toBe(25000);
      expect(result.from).toBe('USD');
      expect(result.to).toBe('VND');
    });
  });

  describe('convert', () => {
    it('should return same amount when currencies are equal', async () => {
      const result = await service.convert(100, 'USD', 'USD');

      expect(result.amount).toBe(100);
      expect(result.rate).toBe(1);
    });

    it('should convert using exchange rate', async () => {
      redisService.get.mockResolvedValue(null); // No cache

      const result = await service.convert(100, 'USD', 'VND');

      // 100 USD * 25000 = 2,500,000 VND
      expect(result.amount).toBe(2500000);
      expect(result.rate).toBe(25000);
    });
  });

  describe('usdToVnd', () => {
    it('should convert USD to VND', async () => {
      redisService.get.mockResolvedValue(null);

      const result = await service.usdToVnd(10);

      expect(result.amountVnd).toBe(250000); // 10 * 25000
      expect(result.rate).toBe(25000);
    });
  });
});
