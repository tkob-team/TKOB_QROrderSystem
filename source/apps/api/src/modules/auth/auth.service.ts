import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/env.validation';
import { RegisterSubmitDto } from './dto/register-submit.dto';
import { AuthResponseDto, RegisterSubmitResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RegisterConfirmDto } from './dto/register-confirm.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

interface RegistrationData {
  email: string;
  passwordHash: string;
  fullName: string;
  tenantName: string;
  slug: string;
  otp: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly email: EmailService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {}

  // ================= REGISTRATION ================

  async registerSubmit(dto: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    const { email, password, fullName, tenantName, slug } = dto;

    // 1. Validate uniqueness (Duplicate Check)
    await this.checkEmailUniqueness(email);

    // Todo: Thống nhất với FE là nếu người dùng ko nhập Slug thì tự động gen -> sau khi đăng ký vẫn bắt buộc người dùng phải đăng ký slug
    // const finalSlug = slug || this.generateSlug(tenantName);
    await this.checkSlugUniqueness(slug);

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // 3. Generate OTP
    const otp = this.generateOTP();

    // 4. Generate registration token (used as Redis key)
    const registrationToken = randomBytes(32).toString('hex');

    // 5. Store in Redis
    const registrationData: RegistrationData = {
      email,
      passwordHash,
      fullName,
      tenantName,
      slug, // slug != null ? slug : null
      otp,
    };

    const ttl = this.config.get('REGISTRATION_DATA_EXPIRY_SECONDS', { infer: true });
    const redisKey = `reg:${registrationToken}`;
    await this.redis.set(redisKey, JSON.stringify(registrationData), ttl);

    // 6. Send OTP email
    try {
      await this.email.sendOTP(email, otp);
    } catch (error) {
      // rollback redis if email fails
      await this.redis.del(redisKey);
      throw new BadRequestException('Failed to send OTP email');
    }

    return {
      message: 'Validation successful. OTP sent to email.',
      registrationToken: registrationToken,
      expiresIn: ttl,
    };
  }

  // Todo: Bàn lại với FE xem có muốn register xong là tự login vô luôn ko? hay phải out ra màn hình login rồi cho login
  async registerConfirm(dto: RegisterConfirmDto): Promise<AuthResponseDto> {
    const { registrationToken, otp } = dto;

    // 1. Retrieve registration data from Redis
    const redisKey = `reg:${registrationToken}`;
    const dataStr = await this.redis.get(redisKey);
    if (!dataStr) {
      throw new BadRequestException('Registration token expired or invalid');
    }

    const data: RegistrationData = JSON.parse(dataStr);

    // 2. Verify OTP
    if (data.otp != otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // 3. Create Tenant & User in a transaction
    try {
      const { user, tenant } = await this.prisma.$transaction(async (tx) => {
        // Create Tenant
        const tenant = await tx.tenant.create({
          data: {
            name: data.tenantName,
            slug: data.slug,
            status: 'ACTIVE',
            onboardingStep: 1,
          },
        });

        // Create User
        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash: data.passwordHash,
            fullName: data.fullName,
            role: 'OWNER',
            status: 'ACTIVE',
            tenantId: tenant.id,
          },
        });

        return { user, tenant };
      });

      // 4. Create session and generate tokens
      const tokens = await this.createSession(user.id, dto.registrationToken.substring(0, 50));

      // 5. Cleanup Redis
      await this.redis.del(redisKey);
      this.logger.log(`User registered successfully: ${user.email}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true }),
        user: user,
        tenant: tenant,
      };
    } catch (err) {
      // Không xóa Redis để người dùng có thể thử lại trong thời gian TTL
      this.logger.error(
        'Registration transaction failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw new BadRequestException('Registration failed, please try again');
    }
  }

  // ==================== LOGIN ====================
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, deviceInfo } = dto;

    // 1. Find user by email
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Check user status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // 4. Create session
    const tokens = await this.createSession(user.id, deviceInfo);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true }),
      user: user,
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
            status: user.tenant.status,
            onboardingStep: user.tenant.onboardingStep,
          }
        : undefined,
    };
  }

  // =============== TOKEN MANAGEMENT ===============
  async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string; expiresIn: number }> {
    const { refreshToken } = dto;

    // 1. Verify refresh token
    let payload: any;
    try {
      payload = this.jwt.verify(refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2. Hash refresh token and check session
    const tokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
    const session = await this.prisma.userSession.findFirst({
      where: {
        userId: payload.sub,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // 3. Generate new access token
    const accessToken = this.generateAccessToken(
      payload.sub,
      payload.email,
      payload.role,
      payload.tenantId,
    );

    // 4. Update last used time
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      accessToken,
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true }),
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Find all sessions of this user
    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
    });

    // Compare refresh token hash to find the correct session
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (isMatch) {
        // Delete only this session (logout from current device)
        await this.prisma.userSession.delete({
          where: { id: session.id },
        });
        this.logger.log(`User logged out from device: ${userId}`);
        return;
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  // =============== HELPER FUNCTION ================

  private async createSession(
    userId: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const accessToken = this.generateAccessToken(user.id, user.email, user.role, user.tenantId);

    const refreshToken = this.generateRefreshToken(user.id);

    const refreshTokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.userSession.create({
      data: {
        userId,
        refreshTokenHash,
        deviceInfo: deviceInfo || 'Unknown',
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private generateAccessToken(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
  ): string {
    const payload = {
      sub: userId,
      email,
      role,
      tenantId,
    };
    const expiresIn = this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', {
      infer: true,
    }) as JwtSignOptions['expiresIn'];
    return this.jwt.sign(payload, { expiresIn });
  }

  generateRefreshToken(userId: any): string {
    const payload = {
      sub: userId,
    };
    const expiresIn = this.config.get('JWT_REFRESH_TOKEN_EXPIRES_IN', {
      infer: true,
    }) as JwtSignOptions['expiresIn'];

    return this.jwt.sign(payload, { expiresIn });
  }

  private generateOTP(): string {
    const length = this.config.get('OTP_LENGTH', { infer: true });
    return Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
    ).toString();
  }

  // Todo: Hình như findUnique trả về 1 đối tượng trong khi này chỉ cần trả về true/ false thôi -> check xem đã tối ưu chưa
  private async checkSlugUniqueness(slug: string) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Slug already exists');
    }
  }

  // private generateSlug(name: string): string {
  //   return name
  //     .toLowerCase()
  //     .replace(/[^a-z0-9]+/g, '-')
  //     .replace(/^-|-$/g, '');
  // }

  private async checkEmailUniqueness(email: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }
  }
}
