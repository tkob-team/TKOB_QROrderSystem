import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { EmailService } from '../../email/email.service';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config/env.validation';
import { RedisKeys } from '../../../common/constants/redis-keys.constant';
import { RegistrationData } from '../interfaces/registration-data.interface';
import { RegisterSubmitDto } from '../dto/register-submit.dto';
import { RegisterConfirmDto } from '../dto/register-confirm.dto';
import { RegisterSubmitResponseDto, AuthResponseDto } from '../dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

/**
 * Registration Service
 * Responsibilities:
 * - Handle 2-step registration flow
 * - Validate uniqueness (email, slug)
 * - Store temporary data in Redis
 * - Create Tenant & User in database
 */
@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly email: EmailService,
    private readonly otp: OtpService,
    private readonly session: SessionService,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {}

  /**
   * Step 1: Submit registration data and send OTP
   * @param dto - Registration submission DTO
   * @returns Registration token and expiry
   */
  async submit(dto: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    const { email, password, fullName, tenantName, slug } = dto;

    // 1. Validate uniqueness
    await this.validateEmailUniqueness(email);
    await this.validateSlugUniqueness(slug);

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // 3. Generate OTP
    const otpCode = this.otp.generate();

    // 4. Generate registration token (Redis key)
    const registrationToken = randomBytes(32).toString('hex');

    // 5. Prepare data for Redis
    const registrationData: RegistrationData = {
      email,
      passwordHash,
      fullName,
      tenantName,
      slug,
      otp: otpCode,
    };

    // 6. Store in Redis
    const ttl = this.config.get('REGISTRATION_DATA_EXPIRY_SECONDS', { infer: true });
    const redisKey = RedisKeys.registration(registrationToken);
    await this.redis.set(redisKey, JSON.stringify(registrationData), ttl);

    // 7. Send OTP email
    try {
      await this.email.sendOTP(email, otpCode);
    } catch (error) {
      // Rollback Redis if email fails
      await this.redis.del(redisKey);
      this.logger.error(`Failed to send OTP email: ${error.message}`);
      throw new BadRequestException('Failed to send OTP email. Please try again.');
    }

    this.logger.log(`Registration submitted for email: ${email}`);

    return {
      message: 'Validation successful. OTP sent to email.',
      registrationToken,
      expiresIn: ttl,
    };
  }

  /**
   * Step 2: Confirm OTP and create account
   * @param dto - Registration confirmation DTO
   * @returns Auth response with tokens
   */
  async confirm(dto: RegisterConfirmDto): Promise<AuthResponseDto> {
    const { registrationToken, otp } = dto;

    // 1. Retrieve registration data from Redis
    const redisKey = RedisKeys.registration(registrationToken);
    const dataStr = await this.redis.get(redisKey);

    if (!dataStr) {
      throw new BadRequestException(
        'Registration token expired or invalid. Please start registration again.',
      );
    }

    const data: RegistrationData = JSON.parse(dataStr);

    // 2. Verify OTP
    if (data.otp !== otp) {
      throw new BadRequestException('Invalid OTP code. Please try again.');
    }

    // 3. Create Tenant & User in transaction
    let user: any;
    let tenant: any;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create Tenant
        const newTenant = await tx.tenant.create({
          data: {
            name: data.tenantName,
            slug: data.slug,
            status: 'ACTIVE',
            onboardingStep: 1,
          },
        });

        // Create User (Owner)
        const newUser = await tx.user.create({
          data: {
            email: data.email,
            passwordHash: data.passwordHash,
            fullName: data.fullName,
            role: 'OWNER',
            status: 'ACTIVE',
            tenantId: newTenant.id,
          },
        });

        return { user: newUser, tenant: newTenant };
      });

      user = result.user;
      tenant = result.tenant;
    } catch (error) {
      this.logger.error('Registration transaction failed', error.stack);
      
      // Don't delete Redis data to allow retry
      throw new BadRequestException(
        'Failed to create account. Please try again or contact support.',
      );
    }

    // 4. Create session and generate tokens
    const tokens = await this.session.createSessionWithTokens(
      user.id,
      'Registration Device',
    );

    // 5. Cleanup Redis
    await this.redis.del(redisKey);

    this.logger.log(`User registered successfully: ${user.email}`);

    // 6. Return auth response
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true }),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        onboardingStep: tenant.onboardingStep,
      },
    };
  }

  /**
   * Validate email uniqueness
   * @param email - Email to check
   * @throws ConflictException if exists
   */
  private async validateEmailUniqueness(email: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }
  }

  /**
   * Validate slug uniqueness
   * @param slug - Slug to check
   * @throws ConflictException if exists
   */
  private async validateSlugUniqueness(slug: string): Promise<void> {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Slug already exists');
    }
  }

  /**
   * Resend OTP (if user didn't receive)
   * @param registrationToken - Registration token
   */
  async resendOTP(registrationToken: string): Promise<void> {
    const redisKey = RedisKeys.registration(registrationToken);
    const dataStr = await this.redis.get(redisKey);

    if (!dataStr) {
      throw new BadRequestException('Registration token expired');
    }

    const data: RegistrationData = JSON.parse(dataStr);

    // Generate new OTP
    const newOtp = this.otp.generate();
    data.otp = newOtp;

    // Update Redis
    const ttl = this.config.get('REGISTRATION_DATA_EXPIRY_SECONDS', { infer: true });
    await this.redis.set(redisKey, JSON.stringify(data), ttl);

    // Send email
    await this.email.sendOTP(data.email, newOtp);

    this.logger.log(`OTP resent to: ${data.email}`);
  }
}