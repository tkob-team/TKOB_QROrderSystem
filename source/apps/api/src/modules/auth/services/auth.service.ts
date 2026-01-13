import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RegistrationService } from './registration.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterSubmitDto } from '../dto/register-submit.dto';
import { RegisterConfirmDto } from '../dto/register-confirm.dto';
import { AuthResponseDto, RegisterSubmitResponseDto } from '../dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

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

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Check user status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active. Please contact support.');
    }

    // 4. Create session and generate tokens
    const tokens = await this.session.createSessionWithTokens(user.id, deviceInfo);

    this.logger.log(`User logged in: ${user.email}`);

    // 5. Return auth response
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

    if (!user) {
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
}
