import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'owner@restaurant.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword!123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Chrome 120 on MacOS', required: false })
  @IsString()
  deviceInfo?: string;
}
