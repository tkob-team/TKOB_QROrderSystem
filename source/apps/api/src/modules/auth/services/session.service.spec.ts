import { Test, TestingModule } from '@nestjs/testing';
import { SessionService, SessionData } from './session.service';
import { PrismaService } from '../../../database/prisma.service';
import { TokenService } from './token.service';
import { RedisService } from '../../redis/redis.service';
import { UnauthorizedException } from '@nestjs/common';

describe('SessionService', () => {
  let service: SessionService;
  let prismaService: jest.Mocked<PrismaService>;
  let tokenService: jest.Mocked<TokenService>;
  let redisService: jest.Mocked<RedisService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@test.com',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-456',
    status: 'ACTIVE',
  };

  const mockSession = {
    id: 'session-123',
    userId: 'user-123',
    refreshTokenHash: 'hashed-token',
    deviceInfo: 'Test Device',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    lastUsedAt: new Date(),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const prismaMock = {
      userSession: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const tokenServiceMock: Partial<jest.Mocked<TokenService>> = {
      generateTokenPair: jest.fn().mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
      getRefreshTokenExpirySeconds: jest.fn().mockReturnValue(604800),
    };

    const redisMock: Partial<jest.Mocked<RedisService>> = {
      setJson: jest.fn(),
      getJson: jest.fn(),
      del: jest.fn(),
      deleteByPattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
    tokenService = module.get<TokenService>(TokenService) as jest.Mocked<TokenService>;
    redisService = module.get<RedisService>(RedisService) as jest.Mocked<RedisService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSessionFromRedis', () => {
    it('should return session data from Redis', async () => {
      const sessionData: SessionData = {
        userId: 'user-123',
        email: 'test@test.com',
        role: 'TENANT_ADMIN',
        tenantId: 'tenant-456',
        deviceInfo: 'Test Device',
        sessionId: 'session-123',
        createdAt: new Date().toISOString(),
      };
      redisService.getJson.mockResolvedValue(sessionData);

      const result = await service.getSessionFromRedis('user-123', 'session-123');

      expect(redisService.getJson).toHaveBeenCalledWith('session:user-123:session-123');
      expect(result).toEqual(sessionData);
    });

    it('should return null if session not in Redis', async () => {
      redisService.getJson.mockResolvedValue(null);

      const result = await service.getSessionFromRedis('user-123', 'session-123');

      expect(result).toBeNull();
    });
  });

  describe('createSessionWithTokens', () => {
    it('should create session and return tokens', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.userSession.create as jest.Mock).mockResolvedValue(mockSession);
      (prismaService.userSession.findFirst as jest.Mock).mockResolvedValue({ id: 'session-123' });

      const result = await service.createSessionWithTokens('user-123', 'Test Device');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createSessionWithTokens('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if user is inactive', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: 'INACTIVE',
      });

      await expect(service.createSessionWithTokens('user-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('should throw if no active sessions', async () => {
      (prismaService.userSession.findMany as jest.Mock).mockResolvedValue([]);

      await expect(service.validateRefreshToken('user-123', 'token')).rejects.toThrow(
        'No active session found',
      );
    });
  });

  describe('deleteAllSessions', () => {
    it('should delete all sessions for user', async () => {
      (prismaService.userSession.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });
      redisService.deleteByPattern.mockResolvedValue(3);

      await service.deleteAllSessions('user-123');

      expect(prismaService.userSession.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(redisService.deleteByPattern).toHaveBeenCalledWith('session:user-123:*');
    });
  });

  describe('getUserSessions', () => {
    it('should return active sessions for user', async () => {
      const sessions = [mockSession];
      (prismaService.userSession.findMany as jest.Mock).mockResolvedValue(sessions);

      const result = await service.getUserSessions('user-123');

      expect(prismaService.userSession.findMany).toHaveBeenCalled();
      expect(result).toEqual(sessions);
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should delete expired sessions', async () => {
      (prismaService.userSession.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      await service.cleanupExpiredSessions();

      expect(prismaService.userSession.deleteMany).toHaveBeenCalled();
    });
  });
});
