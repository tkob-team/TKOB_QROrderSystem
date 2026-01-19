import { IsString, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Phở Ngon 123' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'Authentic Vietnamese Pho Restaurant' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: '+84901234567 or 0901234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()]{10,20}$/, {
    message:
      'Phone must be a valid phone number (10-20 digits, optional +, spaces, dashes, parentheses)',
  })
  phone?: string;

  @ApiProperty({ example: '123 Nguyen Hue, District 1, HCMC' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ example: 'pho-ngon-123' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;
}
