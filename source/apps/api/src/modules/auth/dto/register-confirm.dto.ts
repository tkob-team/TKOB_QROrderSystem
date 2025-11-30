import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterConfirmDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-...' })
  @IsString()
  registrationToken: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d+$/, { message: 'OTP must contain only numbers' })
  otp: string;
}