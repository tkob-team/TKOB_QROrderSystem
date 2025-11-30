import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthResponseDto, RegisterSubmitResponseDto } from './dto/auth-response.dto';
import { RegisterSubmitDto } from './dto/register-submit.dto';
import { RegisterConfirmDto } from './dto/register-confirm.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== REGISTRATION ====================
  @Post('register/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Step 1: Submit registration & receive OTP',
    description: 'Validates data, stores temporarily in Redis, and sends OTP to email',
  })
  @ApiResponse({
    status: 200,
    description: 'Registration data validated , OTP sent',
    type: RegisterSubmitResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email or slug already exists' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async registrySubmit(@Body() dto: RegisterSubmitDto): Promise<RegisterSubmitResponseDto> {
    return this.authService.registerSubmit(dto);
  }

  @Post('register/confirm')
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
  async registryConfirm(@Body() dto: RegisterConfirmDto): Promise<AuthResponseDto> {
    return this.authService.registerConfirm(dto);
  }

  // ==================== LOGIN ====================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  // ==================== TOKEN MANAGEMENT ====================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1Ni...',
        expiresIn: 3600,
      },
      properties: {
        accessToken: { type: 'string', example: 'access.token.jwt.string' },
        expiresIn: { type: 'number', example: 3600 },
      },
      type: 'object',
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<{ accessToken: string; expiresIn: number }> {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(@CurrentUser() user: any, @Body() dto: LogoutDto): Promise<void> {
    await this.authService.logout(user.userId, dto.refreshToken);
  }

  // ==================== USER INFO ====================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: any) {
    // User data is already attached by JwtAuthGuard
    return {
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
