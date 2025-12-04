import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';

describe('OtpService', () => {
  let service: OtpService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const configMock: Partial<jest.Mocked<ConfigService>> = {
      get: jest.fn((key: string) => {
        if (key === 'OTP_LENGTH') return 6;
        if (key === 'OTP_EXPIRY_SECONDS') return 300;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpService, { provide: ConfigService, useValue: configMock }],
    }).compile();

    service = module.get<OtpService>(OtpService);
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call configService.get for OTP_LENGTH and OTP_EXPIRY_SECONDS', () => {
    service.generate();
    expect(configService.get).toHaveBeenCalledWith('OTP_LENGTH', { infer: true });
    service.getExpirySeconds();
    expect(configService.get).toHaveBeenCalledWith('OTP_EXPIRY_SECONDS', { infer: true });
  });

  describe('generate', () => {
    it('should generate OTP with correct length', () => {
      const otp = service.generate();
      expect(otp).toHaveLength(6);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs', () => {
      const otp1 = service.generate();
      const otp2 = service.generate();
      expect(otp1).not.toBe(otp2);
    });

    it('should fallback to default OTP length if config is invalid', () => {
      configService.get.mockReturnValueOnce(undefined);
      const otp = service.generate();
      expect(otp).toHaveLength(6);
    });

    it('should generate OTP with no leading zeros if random allows', () => {
      const otp = service.generate();
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    });
  });

  describe('validateFormat', () => {
    it('should validate correct OTP format', () => {
      expect(service.validateFormat('123456')).toBe(true);
    });

    it('should reject OTP with incorrect length', () => {
      expect(service.validateFormat('12345')).toBe(false);
      expect(service.validateFormat('1234567')).toBe(false);
    });

    it('should reject OTP with non-numeric characters', () => {
      expect(service.validateFormat('12345a')).toBe(false);
      expect(service.validateFormat('abcdef')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(service.validateFormat('')).toBe(false);
    });

    it('should reject OTP with whitespace', () => {
      expect(service.validateFormat(' 123456')).toBe(false);
      expect(service.validateFormat('123 456')).toBe(false);
    });
  });

  describe('getExpirySeconds', () => {
    it('should return configured expiry seconds', () => {
      expect(service.getExpirySeconds()).toBe(300);
    });

    it('should fallback to default expiry if config is invalid', () => {
      configService.get.mockReturnValueOnce(undefined);
      expect(service.getExpirySeconds()).toBe(300);
    });
  });
});
