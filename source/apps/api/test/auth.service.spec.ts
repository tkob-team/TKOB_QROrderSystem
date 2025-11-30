import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { EmailService } from '../src/modules/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterSubmitDto } from '../src/modules/auth/dto/register-submit.dto';
import { RegisterConfirmDto } from '../src/modules/auth/dto/register-confirm.dto';
import { LoginDto } from '../src/modules/auth/dto/login.dto';
import { RefreshTokenDto } from '../src/modules/auth/dto/refresh-token.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcrypt = jest.requireMock('bcrypt') as {
  hash: jest.Mock;
  compare: jest.Mock;
};

describe('AuthService (unit)', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let redis: jest.Mocked<RedisService>;
  let email: jest.Mocked<EmailService>;
  let jwt: jest.Mocked<JwtService>;
  let config: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      } as any,
      tenant: {
        findUnique: jest.fn(),
        create: jest.fn(),
      } as any,
      userSession: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      } as any,
      $transaction: jest.fn((cb: any) =>
        cb({
          user: (prismaMock as any).user,
          tenant: (prismaMock as any).tenant,
        }),
      ) as any,
    };

    const redisMock: Partial<jest.Mocked<RedisService>> = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    const emailMock: Partial<jest.Mocked<EmailService>> = {
      sendOTP: jest.fn(),
    };

    const jwtMock: Partial<jest.Mocked<JwtService>> = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const configMock: Partial<jest.Mocked<ConfigService>> = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: EmailService, useValue: emailMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    redis = module.get(RedisService) as jest.Mocked<RedisService>;
    email = module.get(EmailService) as jest.Mocked<EmailService>;
    jwt = module.get(JwtService) as jest.Mocked<JwtService>;
    config = module.get(ConfigService) as jest.Mocked<ConfigService>;

    // default config values
    config.get.mockImplementation((key: string) => {
      switch (key) {
        case 'REGISTRATION_DATA_EXPIRY_SECONDS':
          return 300;
        case 'JWT_ACCESS_TOKEN_EXPIRES_IN':
          return '15m';
        case 'JWT_REFRESH_TOKEN_EXPIRES_IN':
          return '7d';
        case 'OTP_LENGTH':
          return 6;
        default:
          return undefined;
      }
    });

    // reset bcrypt mocks
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
  });

  // ================== registerSubmit ==================

  it('registerSubmit - success flow', async () => {
    const dto: RegisterSubmitDto = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
    };

    // email & slug uniqueness
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue(null);

    // hash password
    bcrypt.hash.mockResolvedValue('hashed-password');

    // redis
    (redis.set as jest.Mock).mockResolvedValue(undefined);

    // email send
    (email.sendOTP as jest.Mock).mockResolvedValue(undefined);

    const result = await service.registerSubmit(dto);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: dto.slug },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), expect.any(Number));
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^reg:/),
      expect.any(String),
      300,
    );
    expect(email.sendOTP).toHaveBeenCalledWith(
      dto.email,
      expect.stringMatching(/^\d{6}$/),
    );
    expect(result.message).toBe('Validation successful. OTP sent to email.');
    expect(result.registrationToken).toBeDefined();
    expect(result.expiresIn).toBe(300);
  });

  it('registerSubmit - throws ConflictException when email exists', async () => {
    const dto: RegisterSubmitDto = {
      email: 'exists@example.com',
      password: 'Password123!',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1' });

    await expect(service.registerSubmit(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
  });

  it('registerSubmit - throws ConflictException when slug exists', async () => {
    const dto: RegisterSubmitDto = {
      email: 'new@example.com',
      password: 'Password123!',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'duplicate-slug',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue({ id: 't1' });

    await expect(service.registerSubmit(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('registerSubmit - rollback redis when email sending fails', async () => {
    const dto: RegisterSubmitDto = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');
    (redis.set as jest.Mock).mockResolvedValue(undefined);

    (email.sendOTP as jest.Mock).mockRejectedValue(new Error('SMTP error'));

    await expect(service.registerSubmit(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(redis.del).toHaveBeenCalledWith(expect.stringMatching(/^reg:/));
  });

  // ================== registerConfirm ==================

  it('registerConfirm - success flow', async () => {
    const registrationToken = 'reg-token';
    const otp = '123456';

    const registrationData = {
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
      otp,
    };

    // redis get
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(registrationData));

    // prisma transaction: create tenant + user
    (prisma.tenant.create as jest.Mock).mockResolvedValue({
      id: 'tenant-1',
      name: registrationData.tenantName,
      slug: registrationData.slug,
      status: 'ACTIVE',
      onboardingStep: 1,
    });

    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: registrationData.email,
      passwordHash: registrationData.passwordHash,
      fullName: registrationData.fullName,
      role: 'OWNER',
      status: 'ACTIVE',
      tenantId: 'tenant-1',
    });

    // createSession flow inside service: mock prisma.user.findUniqueOrThrow and userSession.create
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: registrationData.email,
      role: 'OWNER',
      tenantId: 'tenant-1',
    });
    (prisma.userSession.create as jest.Mock).mockResolvedValue({});

    jwt.sign.mockImplementation((payload: any) => JSON.stringify(payload));

    const dto: RegisterConfirmDto = {
      registrationToken,
      otp,
    };

    const result = await service.registerConfirm(dto);

    expect(redis.get).toHaveBeenCalledWith(`reg:${registrationToken}`);
    expect(prisma.tenant.create).toHaveBeenCalled();
    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.userSession.create).toHaveBeenCalled();
    expect(redis.del).toHaveBeenCalledWith(`reg:${registrationToken}`);
    expect(result.user.email).toBe(registrationData.email);
    expect(result.tenant?.slug).toBe(registrationData.slug);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('registerConfirm - throws when registration token not found', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);

    const dto: RegisterConfirmDto = {
      registrationToken: 'invalid',
      otp: '123456',
    };

    await expect(service.registerConfirm(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('registerConfirm - throws when OTP is invalid', async () => {
    const registrationData = {
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
      otp: '654321',
    };

    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(registrationData));

    const dto: RegisterConfirmDto = {
      registrationToken: 'reg-token',
      otp: '123456',
    };

    await expect(service.registerConfirm(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('registerConfirm - handles transaction failure', async () => {
    const registrationData = {
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
      otp: '123456',
    };

    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(registrationData));

    // make $transaction throw
    (prisma.$transaction as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    );

    const dto: RegisterConfirmDto = {
      registrationToken: 'reg-token',
      otp: '123456',
    };

    await expect(service.registerConfirm(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    // redis.del is NOT called in this case by design
    expect(redis.del).not.toHaveBeenCalled();
  });

  // ================== login ==================

  it('login - success flow', async () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
      deviceInfo: 'Chrome on Mac',
    };

    const user = {
      id: 'user-1',
      email: dto.email,
      passwordHash: 'hashed-password',
      fullName: 'Test User',
      role: 'OWNER',
      status: 'ACTIVE',
      tenantId: 'tenant-1',
      tenant: {
        id: 'tenant-1',
        name: 'Test Tenant',
        slug: 'test-tenant',
        status: 'ACTIVE',
        onboardingStep: 1,
      },
    };

    (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);

    // createSession
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (prisma.userSession.create as jest.Mock).mockResolvedValue({});
    jwt.sign.mockImplementation((payload: any) => JSON.stringify(payload));

    const result = await service.login(dto);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: dto.email },
      include: { tenant: true },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.passwordHash);
    expect(result.user.email).toBe(dto.email);
    expect(result.tenant?.slug).toBe('test-tenant');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('login - throws when user not found', async () => {
    const dto: LoginDto = {
      email: 'notfound@example.com',
      password: 'Password123!',
      deviceInfo: 'Chrome',
    };

    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login - throws when password invalid', async () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: 'wrong',
      deviceInfo: 'Chrome',
    };

    const user = {
      id: 'user-1',
      email: dto.email,
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
    };

    (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login - throws when user status is not ACTIVE', async () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
      deviceInfo: 'Chrome',
    };

    const user = {
      id: 'user-1',
      email: dto.email,
      passwordHash: 'hashed-password',
      status: 'PENDING',
    };

    (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);

    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  // ================== refreshToken ==================

  it('refreshToken - success flow', async () => {
    const dto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    const payload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'OWNER',
      tenantId: 'tenant-1',
    };

    jwt.verify.mockReturnValue(payload);

    (prisma.userSession.findFirst as jest.Mock).mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    jwt.sign.mockImplementation((signPayload: any) => JSON.stringify(signPayload));

    const result = await service.refreshToken(dto);

    expect(jwt.verify).toHaveBeenCalledWith(dto.refreshToken);
    expect(prisma.userSession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { lastUsedAt: expect.any(Date) },
    });
    expect(result.accessToken).toBeDefined();
  });

  it('refreshToken - throws when token invalid', async () => {
    const dto: RefreshTokenDto = {
      refreshToken: 'invalid-token',
    };

    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(service.refreshToken(dto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('refreshToken - throws when session not found', async () => {
    const dto: RefreshTokenDto = {
      refreshToken: 'valid-token',
    };

    jwt.verify.mockReturnValue({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'OWNER',
      tenantId: 'tenant-1',
    });

    (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.refreshToken(dto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  // ================== logout ==================

  it('logout - deletes user sessions', async () => {
    (prisma.userSession.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    bcrypt.hash.mockResolvedValue('hashed-refresh');

    await service.logout('user-1', 'refresh-token');

    expect(prisma.userSession.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });
});

describe('AuthService (unit) - Additional Coverage', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let redis: jest.Mocked<RedisService>;
  let email: jest.Mocked<EmailService>;
  let jwt: jest.Mocked<JwtService>;
  let config: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      } as any,
      tenant: {
        findUnique: jest.fn(),
        create: jest.fn(),
      } as any,
      userSession: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      } as any,
      $transaction: jest.fn((cb: any) =>
        cb({
          user: (prismaMock as any).user,
          tenant: (prismaMock as any).tenant,
        }),
      ) as any,
    };

    const redisMock: Partial<jest.Mocked<RedisService>> = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    const emailMock: Partial<jest.Mocked<EmailService>> = {
      sendOTP: jest.fn(),
    };

    const jwtMock: Partial<jest.Mocked<JwtService>> = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const configMock: Partial<jest.Mocked<ConfigService>> = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: EmailService, useValue: emailMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    redis = module.get(RedisService) as jest.Mocked<RedisService>;
    email = module.get(EmailService) as jest.Mocked<EmailService>;
    jwt = module.get(JwtService) as jest.Mocked<JwtService>;
    config = module.get(ConfigService) as jest.Mocked<ConfigService>;

    // default config values
    config.get.mockImplementation((key: string) => {
      switch (key) {
        case 'REGISTRATION_DATA_EXPIRY_SECONDS':
          return 300;
        case 'JWT_ACCESS_TOKEN_EXPIRES_IN':
          return '15m';
        case 'JWT_REFRESH_TOKEN_EXPIRES_IN':
          return '7d';
        case 'OTP_LENGTH':
          return 6;
        default:
          return undefined;
      }
    });

    // reset bcrypt mocks
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
  });

  // ================== registerSubmit - Additional ==================

  it('registerSubmit - handles password hashing failure', async () => {
    const dto: RegisterSubmitDto = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue(null);
    bcrypt.hash.mockRejectedValue(new Error('Hashing error'));

    await expect(service.registerSubmit(dto)).rejects.toThrow();
  });

  it('registerSubmit - handles Redis connection failure', async () => {
    const dto: RegisterSubmitDto = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.tenant.findUnique as jest.Mock).mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');
    (redis.set as jest.Mock).mockRejectedValue(new Error('Redis connection failed'));

    await expect(service.registerSubmit(dto)).rejects.toThrow();
  });

  // ================== registerConfirm - Additional ==================

  it('registerConfirm - handles race condition: email taken between submit and confirm', async () => {
    const registrationData = {
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
      otp: '123456',
    };

    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(registrationData));

    // Mock transaction to check email uniqueness and throw unique constraint error
    (prisma.$transaction as jest.Mock).mockRejectedValue({
      code: 'P2002', // Prisma unique constraint error
      meta: { target: ['email'] },
    });

    const dto: RegisterConfirmDto = {
      registrationToken: 'reg-token',
      otp: '123456',
    };

    // Code throws BadRequestException when transaction fails
    await expect(service.registerConfirm(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('registerConfirm - handles race condition: slug taken between submit and confirm', async () => {
    const registrationData = {
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      fullName: 'Test User',
      tenantName: 'Test Tenant',
      slug: 'test-tenant',
      otp: '123456',
    };

    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(registrationData));

    // Mock transaction to throw unique constraint error on slug
    (prisma.$transaction as jest.Mock).mockRejectedValue({
      code: 'P2002',
      meta: { target: ['slug'] },
    });

    const dto: RegisterConfirmDto = {
      registrationToken: 'reg-token',
      otp: '123456',
    };

    // Code throws BadRequestException when transaction fails
    await expect(service.registerConfirm(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  // ================== refreshToken - Additional ==================

  it('refreshToken - throws when session expired', async () => {
    const dto: RefreshTokenDto = {
      refreshToken: 'valid-token',
    };

    const payload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'OWNER',
      tenantId: 'tenant-1',
    };

    jwt.verify.mockReturnValue(payload);

    // Session not found due to expiresAt filter in where clause
    // The query filters out expired sessions automatically
    (prisma.userSession.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.refreshToken(dto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('refreshToken - handles deleted user gracefully', async () => {
    const dto: RefreshTokenDto = {
      refreshToken: 'valid-token',
    };

    const payload = {
      sub: 'deleted-user',
      email: 'deleted@example.com',
      role: 'OWNER',
      tenantId: 'tenant-1',
    };

    jwt.verify.mockReturnValue(payload);

    // Session found but user deleted - this is actually allowed in current code
    // The current implementation doesn't check if user exists
    // So this test should verify the behavior works without throwing
    (prisma.userSession.findFirst as jest.Mock).mockResolvedValue({
      id: 'session-1',
      userId: 'deleted-user',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    jwt.sign.mockImplementation((signPayload: any) => JSON.stringify(signPayload));

    // Current implementation doesn't validate user existence in refreshToken
    const result = await service.refreshToken(dto);
    
    expect(result.accessToken).toBeDefined();
    expect(prisma.userSession.update).toHaveBeenCalled();
  });

  // ================== logout - Additional ==================

  it('logout - handles user with no active sessions', async () => {
    (prisma.userSession.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    bcrypt.hash.mockResolvedValue('hashed-refresh');

    await service.logout('user-with-no-sessions', 'refresh-token');

    expect(prisma.userSession.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-with-no-sessions' },
    });
  });

  it('logout - handles database error gracefully', async () => {
    (prisma.userSession.deleteMany as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      service.logout('user-1', 'refresh-token'),
    ).rejects.toThrow('Database error');
  });
});


