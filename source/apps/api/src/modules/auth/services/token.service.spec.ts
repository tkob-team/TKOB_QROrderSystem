import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const jwtMock: Partial<jest.Mocked<JwtService>> = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
      verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@test.com' }),
      decode: jest.fn().mockReturnValue({ sub: 'user-id' }),
    };

    const configMock: Partial<jest.Mocked<ConfigService>> = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_ACCESS_TOKEN_EXPIRES_IN') return '1h';
        if (key === 'JWT_REFRESH_TOKEN_EXPIRES_IN') return '7d';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      const token = service.generateAccessToken('user-123', 'test@test.com', 'TENANT_ADMIN', 'tenant-456');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-123', email: 'test@test.com', role: 'TENANT_ADMIN', tenantId: 'tenant-456' },
        { expiresIn: '1h' },
      );
      expect(token).toBe('mock.jwt.token');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with user id', () => {
      const token = service.generateRefreshToken('user-123');

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user-123' }, { expiresIn: '7d' });
      expect(token).toBe('mock.jwt.token');
    });
  });

  describe('generateTokenPair', () => {
    it('should return both access and refresh tokens', () => {
      const tokens = service.generateTokenPair('user-123', 'test@test.com', 'TENANT_ADMIN', 'tenant-456');

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });
  });

  describe('verifyToken', () => {
    it('should return decoded payload for valid token', () => {
      const payload = service.verifyToken('valid.jwt.token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid.jwt.token');
      expect(payload).toEqual({ sub: 'user-id', email: 'test@test.com' });
    });

    it('should throw UnauthorizedException for invalid token', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyToken('invalid.token')).toThrow(UnauthorizedException);
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const payload = service.decodeToken('any.jwt.token');

      expect(jwtService.decode).toHaveBeenCalledWith('any.jwt.token');
      expect(payload).toEqual({ sub: 'user-id' });
    });
  });

  describe('getAccessTokenExpirySeconds', () => {
    it('should parse "1h" to 3600 seconds', () => {
      const seconds = service.getAccessTokenExpirySeconds();
      expect(seconds).toBe(3600);
    });
  });

  describe('getRefreshTokenExpirySeconds', () => {
    it('should parse "7d" to 604800 seconds', () => {
      const seconds = service.getRefreshTokenExpirySeconds();
      expect(seconds).toBe(604800);
    });
  });
});
