import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthResponseDto, RegisterSubmitResponseDto } from '../dto/auth-response.dto';
import { RegisterSubmitDto } from '../dto/register-submit.dto';
import { RegisterConfirmDto } from '../dto/register-confirm.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { LogoutDto } from '../dto/logout.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

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
}
