import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  CustomerAuthService,
  CustomerRegisterDto,
  CustomerLoginDto,
} from '../services/customer-auth.service';
import { Public } from '../../../common/decorators/public.decorator';
import { CustomerAuthGuard } from '../guards/customer-auth.guard';

@ApiTags('Customer Auth')
@Controller('customer/auth')
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
  ) {}

  // ==================== REGISTRATION ====================

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: CustomerRegisterDto) {
    return this.customerAuthService.register(dto);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with OTP code' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyEmail(@Body() dto: { email: string; otp: string }) {
    return this.customerAuthService.verifyEmail(dto.email, dto.otp);
  }

  // ==================== LOGIN ====================

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: CustomerLoginDto) {
    return this.customerAuthService.login(dto);
  }

  // Note: Google OAuth is handled via /auth/google with state=customer parameter
  // See AuthController.googleAuthCallback()

  // ==================== PROFILE ====================

  @Get('me')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer profile' })
  @ApiResponse({ status: 200, description: 'Customer profile' })
  async getProfile(@Req() req: any) {
    return this.customerAuthService.getProfile(req.customer.id);
  }

  @Patch('me')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @Req() req: any,
    @Body() dto: { fullName?: string; avatarUrl?: string; phone?: string },
  ) {
    return this.customerAuthService.updateProfile(req.customer.id, dto);
  }

  // ==================== PASSWORD ====================

  @Post('change-password')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change customer password' })
  async changePassword(
    @Req() req: any,
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    return this.customerAuthService.changePassword(
      req.customer.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: { email: string }) {
    return this.customerAuthService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  async resetPassword(@Body() dto: { email: string; otp: string; newPassword: string }) {
    return this.customerAuthService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  // ==================== LOGOUT ====================

  @Post('logout')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@Req() req: any) {
    const refreshToken = req.headers['x-refresh-token'] || req.body?.refreshToken;
    return this.customerAuthService.logout(req.customer.id, refreshToken);
  }

  @Post('logout-all')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(@Req() req: any) {
    return this.customerAuthService.logoutAll(req.customer.id);
  }
}
