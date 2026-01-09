import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ['RECEIVED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'PAID', 'CANCELLED'],
  })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
