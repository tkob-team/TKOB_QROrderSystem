import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: 'uuid-user-1' })
  id: string;

  @ApiProperty({ example: 'owner@restaurant.com' })
  email: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiProperty({ example: 'OWNER', enum: ['OWNER', 'STAFF', 'KITCHEN'] })
  role: string;

  @ApiProperty({ example: 'uuid-tenant-1', required: false })
  tenantId?: string;
}

export class AuthTenantResponseDto {
  @ApiProperty({ example: 'uuid-tenant-1' })
  id: string;

  @ApiProperty({ example: 'Pho Ngon 123' })
  name: string;

  @ApiProperty({ example: 'pho-ngon-123' })
  slug: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['DRAFT', 'ACTIVE', 'SUSPENDED'] })
  status: string;

  @ApiProperty({ example: 1 })
  onboardingStep: number;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1Ni...' })
  accessToken: string;

  @ApiProperty({ example: 'd792f321-...' })
  refreshToken: string;

  @ApiProperty({ example: 3600, description: 'Access token expiration time in seconds' })
  expiresIn: number;

  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;

  @ApiProperty({ type: AuthTenantResponseDto, required: false })
  tenant?: AuthTenantResponseDto;
}

export class RegisterSubmitResponseDto {
  @ApiProperty({ example: 'Validation successful. OTP sent to email.' })
  message: string;

  @ApiProperty({ example: 'a1b2c3d4-...' })
  registrationToken: string;

  @ApiProperty({ example: 600 })
  expiresIn: number;
}
