import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RegistrationService } from './registration.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterSubmitDto } from '../dto/register-submit.dto';
import { RegisterConfirmDto } from '../dto/register-confirm.dto';
import { AuthResponseDto, RegisterSubmitResponseDto } from '../dto/auth-response.dto';
import { ForgotPasswordDto, ForgotPasswordResponseDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto, ResetPasswordResponseDto } from '../dto/reset-password.dto';
import { VerifyEmailDto, VerifyEmailResponseDto } from '../dto/verify-email.dto';
import {
  ResendVerificationDto,
  ResendVerificationResponseDto,
} from '../dto/resend-verification.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { EmailService } from '../../email/email.service';
import { RedisService } from '../../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config/env.validation';
import { SeedService } from '@/database/seed/seed.service';

/**
 * Auth Service (Main Orchestrator)
 * Responsibilities:
 * - Orchestrate auth flows (login, logout, refresh)
 * - Delegate specific tasks to specialized services
 * - Handle password verification
 *
 * This is a THIN service that coordinates other services
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registration: RegistrationService,
    private readonly session: SessionService,
    private readonly token: TokenService,
    private readonly email: EmailService,
    private readonly redis: RedisService,
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly seedService: SeedService,
  ) {}

  // ==================== REGISTRATION ====================
  // Delegate to RegistrationService

  /**
   * Step 1: Submit registration
   */
  async registerSubmit(dto: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    return this.registration.submit(dto);
  }

  /**
   * Step 2: Confirm OTP
   */
  async registerConfirm(dto: RegisterConfirmDto): Promise<AuthResponseDto> {
    return this.registration.confirm(dto);
  }

  // ==================== LOGIN ====================

  /**
   * User login with email/password
   * @param dto - Login credentials
   * @returns Auth response with tokens
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, deviceInfo } = dto;

    // 1. Find user by email (include tenant for response)
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      // Generic error message to prevent email enumeration
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check if user has a password (may be null for Google OAuth users)
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account was created with Google. Please sign in with Google.',
      );
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Check user status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active. Please contact support.');
    }

    // 5. Create session and generate tokens
    const tokens = await this.session.createSessionWithTokens(user.id, deviceInfo);

    // 6. [FIRST LOGIN SEED] Check if this is first login and should seed demo data
    if (user.tenantId) {
      try {
        await this.seedDemoDataOnFirstLogin(user.id, user.tenantId);
      } catch (seedError) {
        // Don't fail login if seed fails
        this.logger.error(`Failed to seed demo data for tenant ${user.tenantId}:`, seedError);
      }
    }

    this.logger.log(`User logged in: ${user.email}`);

    // 7. Return auth response
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.token.getAccessTokenExpirySeconds(),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
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

  // ==================== TOKEN MANAGEMENT ====================

  /**
   * Refresh access token using refresh token
   * @param dto - Refresh token DTO
   * @returns New access token
   */
  async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string }> {
    const { refreshToken } = dto;

    // 1. Verify refresh token JWT
    let payload: any;
    try {
      payload = this.token.verifyToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub;

    // 2. Validate refresh token in database
    await this.session.validateRefreshToken(userId, refreshToken);

    // 3. Fetch user to generate new access token
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    // 4. Generate new access token
    const accessToken = this.token.generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.tenantId,
    );

    this.logger.debug(`Access token refreshed for user: ${userId}`);

    return { accessToken };
  }

  /**
   * Logout user (revoke refresh token)
   * @param userId - User ID from JWT
   * @param refreshToken - Refresh token to revoke
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.session.deleteSession(userId, refreshToken);
    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * Logout from all devices
   * @param userId - User ID
   */
  async logoutAll(userId: string): Promise<void> {
    await this.session.deleteAllSessions(userId);
    this.logger.log(`User logged out from all devices: ${userId}`);
  }

  // ==================== USER INFO ====================

  /**
   * Get current user info (used by /me endpoint)
   * @param userId - User ID from JWT
   * @returns User and tenant info
   */
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
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

  // ==================== AVATAR UPLOAD ====================

  /**
   * Upload user avatar
   * @param userId - User ID
   * @param file - Multer file object
   * @returns Avatar URL
   */
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB');
    }

    // Generate unique filename
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `avatars/${userId}-${Date.now()}.${ext}`;

    // Save file to uploads directory
    const fs = await import('fs/promises');
    const path = await import('path');
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(process.cwd(), 'uploads', filename);
    await fs.writeFile(filePath, file.buffer);

    // Build public URL
    const apiPort = this.config.get('API_PORT', { infer: true });
    const avatarUrl = `http://localhost:${apiPort}/uploads/${filename}`;

    // Update user record
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    this.logger.log(`Avatar uploaded for user: ${userId}`);

    return avatarUrl;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Verify user password (for sensitive operations)
   * @param userId - User ID
   * @param password - Password to verify
   * @returns true if valid
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return false;
    }

    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param oldPassword - Current password
   * @param newPassword - New password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Check if user has a password (Google OAuth users may not)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'Cannot change password for Google OAuth account. Please set a password first.',
      );
    }

    // Verify old password
    const isValid = await this.verifyPassword(userId, oldPassword);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Logout from all devices for security
    await this.logoutAll(userId);

    this.logger.log(`Password changed for user: ${userId}`);
  }

  /**
   * Update user profile (fullName)
   */
  async updateProfile(userId: string, data: { fullName: string }): Promise<any> {
    this.logger.debug(`Updating profile for user: ${userId}`);

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
      },
    });

    this.logger.log(`Profile updated for user: ${userId}`);
    return updatedUser;
  }

  // ==================== PASSWORD RESET ====================

  /**
   * Request password reset (send reset link via email)
   * @param dto - ForgotPasswordDto
   * @returns Response with status message
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    const { email } = dto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true },
    });

    // Always return success (don't reveal if email exists for security)
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return {
        message:
          'If an account exists with this email, you will receive a password reset link shortly.',
        email,
      };
    }

    // Generate reset token (32 bytes = 64 hex chars)
    const resetToken = randomBytes(32).toString('hex');

    // Store in Redis with 15 min expiry
    const redisKey = `password-reset:${resetToken}`;
    const ttl = 15 * 60; // 15 minutes
    await this.redis.set(redisKey, JSON.stringify({ userId: user.id, email: user.email }), ttl);

    // Generate reset link
    const frontendUrl = this.config.get('TENANT_APP_URL', { infer: true });
    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    // Send email
    try {
      await this.email.sendPasswordReset(user.email, resetLink);
      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to: ${email}`, error);
      // Clean up Redis token
      await this.redis.del(redisKey);
      throw new BadRequestException('Failed to send password reset email. Please try again later.');
    }

    return {
      message:
        'If an account exists with this email, you will receive a password reset link shortly.',
      email,
    };
  }

  /**
   * Reset password with token
   * @param dto - ResetPasswordDto
   * @returns Response with status message
   */
  async resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    const { token, newPassword } = dto;

    // Retrieve data from Redis
    const redisKey = `password-reset:${token}`;
    const data = await this.redis.get(redisKey);

    if (!data) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const { userId, email } = JSON.parse(data);

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Delete token from Redis (one-time use)
    await this.redis.del(redisKey);

    // Logout from all devices for security
    await this.session.deleteAllSessions(userId);

    this.logger.log(`Password reset successful for user: ${email}`);

    return {
      message: 'Password reset successful. You can now log in with your new password.',
      email,
    };
  }

  /**
   * Verify reset password token (without resetting)
   * Used by frontend to check if token is valid before showing reset form
   * @param token - Reset token from URL
   * @returns Validation status
   */
  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const redisKey = `password-reset:${token}`;
    const data = await this.redis.get(redisKey);

    if (!data) {
      return { valid: false };
    }

    const { email } = JSON.parse(data);
    return { valid: true, email };
  }

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Verify email address with token
   * @param dto - VerifyEmailDto
   * @returns Response with verification status
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    const { token } = dto;

    // Retrieve data from Redis
    const redisKey = `email-verification:${token}`;
    const data = await this.redis.get(redisKey);

    if (!data) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const { userId, email } = JSON.parse(data);

    // Mark user as ACTIVE (email verified)
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });

    // Delete token from Redis (one-time use)
    await this.redis.del(redisKey);

    this.logger.log(`Email verified for user: ${email}`);

    return {
      message: 'Email verified successfully!',
      email,
      verified: true,
    };
  }

  /**
   * Resend verification email
   * @param dto - ResendVerificationDto
   * @returns Response with status message
   */
  async resendVerification(dto: ResendVerificationDto): Promise<ResendVerificationResponseDto> {
    const { email } = dto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true, status: true },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email address');
    }

    if (user.status === 'ACTIVE') {
      return {
        message: 'Your email is already verified',
        email,
      };
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Store in Redis with 24 hour expiry
    const redisKey = `email-verification:${verificationToken}`;
    const ttl = 24 * 60 * 60; // 24 hours
    await this.redis.set(redisKey, JSON.stringify({ userId: user.id, email: user.email }), ttl);

    // Generate verification link
    const frontendUrl = this.config.get('CUSTOMER_APP_URL', { infer: true });
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;

    // Send email
    try {
      await this.email.sendEmailVerification(user.email, verificationLink);
      this.logger.log(`Verification email resent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to resend verification email to: ${email}`, error);
      // Clean up Redis token
      await this.redis.del(redisKey);
      throw new BadRequestException('Failed to send verification email. Please try again later.');
    }

    return {
      message: 'Verification email sent. Please check your inbox.',
      email,
    };
  }

  // ==================== FIRST LOGIN SEEDING ====================

  /**
   * Seed demo data on first login (after registration)
   * Only seeds if tenant has no existing menu items (hasn't been seeded before)
   * For demo: Every new tenant gets seed data on first login
   */
  private async seedDemoDataOnFirstLogin(userId: string, tenantId: string): Promise<void> {
    // Check if tenant already has data (avoid re-seeding)
    const existingItems = await this.prisma.menuItem.count({ where: { tenantId } });
    if (existingItems > 0) {
      this.logger.debug(
        `Skipping seed: Tenant ${tenantId} already has ${existingItems} menu items`,
      );
      return;
    }

    // Seed demo data for this tenant
    this.logger.log(`🌱 Seeding demo data for tenant: ${tenantId} (first login)`);
    await this.seedService.seedTenantData(tenantId);
    this.logger.log(`✅ Demo data seeded successfully for tenant: ${tenantId}`);
  }

  // ==================== GOOGLE OAUTH ====================

  /**
   * Handle Google OAuth callback
   * - Find or create user based on Google profile
   * - Create session and return tokens
   */
  async googleAuth(googleUser: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  }): Promise<AuthResponseDto & { isNewUser: boolean }> {
    const { googleId, email, fullName, avatarUrl } = googleUser;

    // 1. Try to find user by Google ID first
    let user = await this.prisma.user.findUnique({
      where: { googleId },
      include: { tenant: true },
    });

    let isNewUser = false;

    if (!user) {
      // 2. Check if user exists with this email (link accounts)
      user = await this.prisma.user.findFirst({
        where: { email },
        include: { tenant: true },
      });

      if (user) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: user.avatarUrl || avatarUrl },
          include: { tenant: true },
        });
        this.logger.log(`Linked Google account to existing user: ${email}`);
      } else {
        // No existing user - this is a new tenant owner registration via Google
        // Create tenant and user together
        isNewUser = true;
        const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        const tenant = await this.prisma.tenant.create({
          data: {
            name: `${fullName}'s Restaurant`,
            slug: `${slug}-${Date.now()}`,
            status: 'DRAFT',
          },
        });

        user = await this.prisma.user.create({
          data: {
            email,
            fullName,
            googleId,
            avatarUrl,
            role: 'OWNER',
            status: 'ACTIVE', // Google already verified email
            tenantId: tenant.id,
          },
          include: { tenant: true },
        });
        this.logger.log(`Created new tenant owner via Google OAuth: ${email}`);
      }
    }

    // 4. Check user status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active. Please contact support.');
    }

    // 5. Create session
    const tokens = await this.session.createSessionWithTokens(user.id);

    // 6. Seed demo data if new user
    if (isNewUser && user.tenantId) {
      try {
        await this.seedDemoDataOnFirstLogin(user.id, user.tenantId);
      } catch (seedError) {
        this.logger.error(`Failed to seed demo data:`, seedError);
      }
    }

    this.logger.log(`User logged in via Google: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.token.getAccessTokenExpirySeconds(),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
            status: user.tenant.status,
            onboardingStep: user.tenant.onboardingStep,
          }
        : undefined,
      isNewUser,
    };
  }
}
