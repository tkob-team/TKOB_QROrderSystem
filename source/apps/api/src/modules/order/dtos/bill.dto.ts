import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { OrderResponseDto } from './order-response.dto';

/**
 * DTO for closing table and generating bill
 */
export class CloseTableDto {
  @ApiProperty({
    description: 'Payment method for the bill',
    enum: PaymentMethod,
    example: 'BILL_TO_TABLE',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Additional tip amount (in USD cents)',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tip?: number;

  @ApiPropertyOptional({
    description: 'Bill-level discount (in USD cents)',
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({
    description: 'Notes for the bill',
    example: 'VIP customer discount applied',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Response DTO for Bill
 */
export class BillResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  billNumber: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  tableId: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty({ description: 'Subtotal in USD cents' })
  subtotal: number;

  @ApiProperty({ description: 'Discount in USD cents' })
  discount: number;

  @ApiProperty({ description: 'Tip in USD cents' })
  tip: number;

  @ApiProperty({ description: 'Service charge in USD cents' })
  serviceCharge: number;

  @ApiProperty({ description: 'Tax in USD cents' })
  tax: number;

  @ApiProperty({ description: 'Total amount in USD cents' })
  total: number;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty()
  paymentStatus: string;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ 
    description: 'Orders included in this bill', 
    type: [OrderResponseDto],
  })
  orders: OrderResponseDto[];

  @ApiPropertyOptional()
  table?: any;
}
