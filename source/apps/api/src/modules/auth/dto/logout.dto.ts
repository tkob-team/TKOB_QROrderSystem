import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
