import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterSubmitDto {
  @ApiProperty({ example: 'owner@restaurant.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'StrongPassword!123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least one number and one special character',
  })
  password: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'Pho Ngon 123' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  tenantName: string;

  @ApiProperty({ example: 'pho-ngon-123'})
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;
}