import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthResponseDto, RegisterSubmitResponseDto } from '../dto/auth-response.dto';
import { RegisterSubmitDto } from '../dto/register-submit.dto';
import { RegisterConfirmDto } from '../dto/register-confirm.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LogoutDto } from '../dto/logout.dto';
import { ForgotPasswordDto, ForgotPasswordResponseDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto, ResetPasswordResponseDto } from '../dto/reset-password.dto';
import { VerifyEmailDto, VerifyEmailResponseDto } from '../dto/verify-email.dto';
import {
  ResendVerificationDto,
  ResendVerificationResponseDto,
} from '../dto/resend-verification.dto';
import { ChangePasswordDto, ChangePasswordResponseDto } from '../dto/change-password.dto';
import { UpdateUserProfileDto, UpdateProfileResponseDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { SkipTransform } from '../../../common/interceptors/transform.interceptor';

/**
 * Auth Controller
 * Handles authentication endpoints
 *
 * All endpoints are public by default except /me
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== REGISTRATION ====================

  @Post('register/submit')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Step 1: Submit registration & receive OTP',
    description: 'Validates registration data, stores temporarily in Redis, and sends OTP to email',
  })
  @ApiResponse({
    status: 200,
    description: 'Registration data validated, OTP sent',
    type: RegisterSubmitResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email or slug already exists' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async registerSubmit(@Body() dto: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    return this.authService.registerSubmit(dto);
  }

  @Post('register/confirm')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Step 2: Confirm OTP & create account',
    description: 'Verifies OTP, creates Tenant & User, returns auth tokens',
  })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or token expired' })
  async registerConfirm(@Body() dto: RegisterConfirmDto): Promise<AuthResponseDto> {
    return this.authService.registerConfirm(dto);
  }

  // ==================== LOGIN ====================

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  // ==================== TOKEN MANAGEMENT ====================

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access token using valid refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @SkipTransform()
  @ApiOperation({
    summary: 'Logout user',
    description: 'Revoke refresh token and end session',
  })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: any, @Body() dto: LogoutDto): Promise<void> {
    await this.authService.logout(user.userId, dto.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @SkipTransform()
  @ApiOperation({
    summary: 'Logout from all devices',
    description: 'Revoke all refresh tokens for the user',
  })
  @ApiResponse({ status: 204, description: 'Logged out from all devices' })
  async logoutAll(@CurrentUser() user: any): Promise<void> {
    await this.authService.logoutAll(user.userId);
  }

  // ==================== USER INFO ====================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve authenticated user information and tenant details',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            fullName: { type: 'string' },
            role: { type: 'string' },
            tenantId: { type: 'string' },
          },
        },
        tenant: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            status: { type: 'string' },
            onboardingStep: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user.userId);
  }

  // ==================== CHANGE PASSWORD ====================

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password',
    description: 'Change password for authenticated user. Requires current password verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Password changed successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    await this.authService.changePassword(user.userId, dto.currentPassword, dto.newPassword);
    return { message: 'Password changed successfully' };
  }

  // ==================== UPDATE PROFILE ====================

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update profile information for authenticated user (fullName only for now)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UpdateProfileResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    const updatedUser = await this.authService.updateProfile(user.userId, dto);
    return {
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
      },
    };
  }

  // ==================== AVATAR UPLOAD ====================

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload user avatar',
    description: 'Upload or update profile avatar for authenticated user',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPEG, PNG, WebP, GIF - max 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Avatar updated successfully' },
        avatarUrl: {
          type: 'string',
          example: 'http://localhost:3000/uploads/avatars/user-123.jpg',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; avatarUrl: string }> {
    if (!file) {
      throw new Error('Avatar file is required');
    }
    const avatarUrl = await this.authService.uploadAvatar(user.userId, file);
    return { message: 'Avatar updated successfully', avatarUrl };
  }

  // ==================== PASSWORD RESET ====================

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset link to user email',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email exists)',
    type: ForgotPasswordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Change password using reset token from email',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-reset-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify reset password token',
    description: 'Check if a reset password token is valid without resetting the password',
  })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
    schema: {
      properties: {
        valid: { type: 'boolean' },
        email: { type: 'string' },
      },
    },
  })
  async verifyResetToken(
    @Body('token') token: string,
  ): Promise<{ valid: boolean; email?: string }> {
    return this.authService.verifyResetToken(token);
  }

  // ==================== EMAIL VERIFICATION ====================

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Confirm email using verification token from email',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: VerifyEmailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Send new verification link to user email',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
    type: ResendVerificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Email already verified' })
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<ResendVerificationResponseDto> {
    return this.authService.resendVerification(dto);
  }
}
