import { ApiProperty } from '@nestjs/swagger';

export class GoogleUserDto {
  @ApiProperty({ description: 'Google OAuth ID' })
  googleId: string;

  @ApiProperty({ description: 'User email from Google' })
  email: string;

  @ApiProperty({ description: 'User full name from Google' })
  fullName: string;

  @ApiProperty({ description: 'User avatar URL from Google', required: false })
  avatarUrl?: string;
}

class UserInfoDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId: string;
}

class TenantInfoDto {
  @ApiProperty({ description: 'Tenant ID' })
  id: string;

  @ApiProperty({ description: 'Tenant name' })
  name: string;

  @ApiProperty({ description: 'Tenant slug' })
  slug: string;

  @ApiProperty({ description: 'Tenant status' })
  status: string;

  @ApiProperty({ description: 'Onboarding step' })
  onboardingStep: number;
}

export class GoogleAuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token expiry time in seconds' })
  expiresIn: number;

  @ApiProperty({
    description: 'User information',
    type: UserInfoDto,
  })
  user: UserInfoDto;

  @ApiProperty({
    description: 'Tenant information',
    required: false,
    type: TenantInfoDto,
  })
  tenant?: TenantInfoDto;

  @ApiProperty({ description: 'Whether this is a newly created user' })
  isNewUser: boolean;
}
