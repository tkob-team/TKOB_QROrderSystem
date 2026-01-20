import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { TokenService } from './token.service';
import { EmailService } from '../../email/email.service';
import { EnvConfig } from '../../../config/env.validation';
import { CustomerSessionService } from './customer-session.service';

// DTOs for customer auth
export interface CustomerRegisterDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface CustomerLoginDto {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface CustomerAuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  customer: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
  };
}

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly token: TokenService,
    private readonly email: EmailService,
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly session: CustomerSessionService,
  ) {}

  // ==================== CUSTOMER REGISTRATION ====================

  /**
   * Register a new customer account
   */
  async register(dto: CustomerRegisterDto): Promise<{ message: string; email: string }> {
    const { email, password, fullName } = dto;

    // 1. Check if email already exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      throw new ConflictException('Email already registered');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 3. Create customer with PENDING status
    const customer = await this.prisma.customer.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || email.split('@')[0],
        status: 'PENDING',
      },
    });

    // 4. Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `customer-email-otp:${email}`;
    const ttl = 10 * 60; // 10 minutes
    await this.redis.set(redisKey, JSON.stringify({ customerId: customer.id, otp }), ttl);

    // 5. Send verification email with OTP
    try {
      await this.email.sendOTP(email, otp);
      this.logger.log(`Sent OTP verification email to customer: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to: ${email}`, error);
      // Clean up on failure
      await this.prisma.customer.delete({ where: { id: customer.id } });
      await this.redis.del(redisKey);
      throw new BadRequestException('Failed to send verification email. Please try again.');
    }

    return {
      message: 'Registration successful. Please check your email for the verification code.',
      email,
    };
  }

  /**
   * Verify customer email with OTP
   */
  async verifyEmail(email: string, otp: string): Promise<{ message: string; verified: boolean }> {
    const redisKey = `customer-email-otp:${email}`;
    const stored = await this.redis.get(redisKey);

    if (!stored) {
      throw new BadRequestException('Verification code expired or invalid. Please request a new one.');
    }

    const { customerId, otp: storedOtp } = JSON.parse(stored);

    if (otp !== storedOtp) {
      throw new BadRequestException('Invalid verification code');
    }

    // Update customer status to ACTIVE
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { status: 'ACTIVE' },
    });

    // Clean up Redis
    await this.redis.del(redisKey);

    this.logger.log(`Email verified for customer: ${email}`);

    return {
      message: 'Email verified successfully!',
      verified: true,
    };
  }

  // ==================== CUSTOMER LOGIN ====================

  /**
   * Customer login with email/password
   */
  async login(dto: CustomerLoginDto): Promise<CustomerAuthResponseDto> {
    const { email, password, deviceInfo } = dto;

    // 1. Find customer by email
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check if customer has a password (may be null for Google OAuth)
    if (!customer.passwordHash) {
      throw new UnauthorizedException(
        'This account was created with Google. Please sign in with Google.',
      );
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Check customer status
    if (customer.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active. Please verify your email first.');
    }

    // 5. Create session and generate tokens
    const tokens = await this.session.createSessionWithTokens(customer.id, deviceInfo);

    this.logger.log(`Customer logged in: ${customer.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.token.getAccessTokenExpirySeconds(),
      customer: {
        id: customer.id,
        email: customer.email,
        fullName: customer.fullName,
        avatarUrl: customer.avatarUrl,
      },
    };
  }

  // ==================== GOOGLE OAUTH FOR CUSTOMERS ====================

  /**
   * Handle Google OAuth for customers
   */
  async googleAuth(googleUser: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  }): Promise<CustomerAuthResponseDto & { isNewUser: boolean }> {
    const { googleId, email, fullName, avatarUrl } = googleUser;

    // 1. Try to find customer by Google ID first
    let customer = await this.prisma.customer.findUnique({
      where: { googleId },
    });

    let isNewUser = false;

    if (!customer) {
      // 2. Check if customer exists with this email (link accounts)
      customer = await this.prisma.customer.findUnique({
        where: { email },
      });

      if (customer) {
        // Link Google account to existing customer
        customer = await this.prisma.customer.update({
          where: { id: customer.id },
          data: { googleId, avatarUrl: customer.avatarUrl || avatarUrl },
        });
        this.logger.log(`Linked Google account to existing customer: ${email}`);
      } else {
        // 3. Create new customer
        isNewUser = true;

        customer = await this.prisma.customer.create({
          data: {
            email,
            fullName,
            googleId,
            avatarUrl,
            status: 'ACTIVE', // Google already verified email
          },
        });
        this.logger.log(`Created new customer via Google OAuth: ${email}`);
      }
    }

    // 4. Check customer status
    if (customer.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active. Please contact support.');
    }

    // 5. Create session
    const tokens = await this.session.createSessionWithTokens(customer.id);

    this.logger.log(`Customer logged in via Google: ${customer.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.token.getAccessTokenExpirySeconds(),
      customer: {
        id: customer.id,
        email: customer.email,
        fullName: customer.fullName,
        avatarUrl: customer.avatarUrl,
      },
      isNewUser,
    };
  }

  // ==================== CUSTOMER PROFILE ====================

  /**
   * Get current customer profile
   */
  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    return customer;
  }

  /**
   * Update customer profile
   */
  async updateProfile(
    customerId: string,
    data: { fullName?: string; avatarUrl?: string; phone?: string },
  ) {
    const customer = await this.prisma.customer.update({
      where: { id: customerId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        phone: true,
      },
    });

    return customer;
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Change customer password
   */
  async changePassword(
    customerId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || !customer.passwordHash) {
      throw new BadRequestException('Cannot change password for OAuth accounts');
    }

    const isValid = await bcrypt.compare(currentPassword, customer.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!customer) {
      return { message: 'If an account exists with this email, a reset link will be sent.' };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `customer-password-reset:${email}`;
    const ttl = 10 * 60; // 10 minutes
    await this.redis.set(redisKey, JSON.stringify({ customerId: customer.id, otp }), ttl);

    // Send reset email
    try {
      await this.email.sendOTP(email, otp);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to: ${email}`, error);
    }

    return { message: 'If an account exists with this email, a reset code will be sent.' };
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const redisKey = `customer-password-reset:${email}`;
    const stored = await this.redis.get(redisKey);

    if (!stored) {
      throw new BadRequestException('Reset code expired or invalid');
    }

    const { customerId, otp: storedOtp } = JSON.parse(stored);

    if (otp !== storedOtp) {
      throw new BadRequestException('Invalid reset code');
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { passwordHash: newHash },
    });

    await this.redis.del(redisKey);

    return { message: 'Password reset successfully' };
  }

  // ==================== LOGOUT ====================

  /**
   * Logout customer (invalidate session)
   */
  async logout(customerId: string, refreshToken: string): Promise<{ message: string }> {
    await this.session.revokeSession(customerId, refreshToken);
    return { message: 'Logged out successfully' };
  }

  /**
   * Logout from all devices
   */
  async logoutAll(customerId: string): Promise<{ message: string }> {
    await this.session.revokeAllSessions(customerId);
    return { message: 'Logged out from all devices' };
  }
}
