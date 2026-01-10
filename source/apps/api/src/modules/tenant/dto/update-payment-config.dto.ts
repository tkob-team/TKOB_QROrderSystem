import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentConfigDto {
  @ApiProperty({ example: 'acct_123456789' })
  @IsString()
  stripeAccountId: string;
}
