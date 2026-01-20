import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Order ID to create payment for',
    example: 'e8f9a0b1-2c3d-4e5f-6a7b-8c9d0e1f2a3b',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Return URL after payment completion',
    example: 'https://app.restaurant.com/order/success',
  })
  @IsString()
  returnUrl: string;

  @ApiProperty({
    description: 'Cancel URL if payment is cancelled',
    example: 'https://app.restaurant.com/order/cancel',
    required: false,
  })
  @IsString()
  @IsOptional()
  cancelUrl?: string;

  @ApiProperty({
    description: 'Tip amount in USD (optional)',
    example: 5.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tip?: number;

  @ApiProperty({
    description: 'Discount amount in USD (optional, from voucher)',
    example: 10.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({
    description: 'Voucher code used for discount (optional)',
    example: 'SUMMER2024',
    required: false,
  })
  @IsString()
  @IsOptional()
  voucherCode?: string;
}
