import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: 'Table for celebration' })
  @IsString()
  @IsOptional()
  customerNotes?: string;

  @ApiProperty({
    enum: ['BILL_TO_TABLE', 'CARD_ONLINE'],
    example: 'BILL_TO_TABLE',
  })
  @IsString()
  paymentMethod: 'BILL_TO_TABLE' | 'CARD_ONLINE';
}
