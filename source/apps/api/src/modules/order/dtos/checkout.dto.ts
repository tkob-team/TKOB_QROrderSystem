import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CheckoutDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: 'Table for celebration' })
  @IsString()
  @IsOptional()
  customerNotes?: string;

  @ApiPropertyOptional({
    enum: ['BILL_TO_TABLE', 'CARD_ONLINE', 'SEPAY_QR'],
    example: 'BILL_TO_TABLE',
    description: 'Payment method. Defaults to BILL_TO_TABLE if not specified.',
    default: 'BILL_TO_TABLE',
  })
  @IsString()
  @IsOptional()
  paymentMethod?: 'BILL_TO_TABLE' | 'CARD_ONLINE' | 'SEPAY_QR';

  @ApiPropertyOptional({ example: 5.00, description: 'Tip amount in USD' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tip?: number;
}
