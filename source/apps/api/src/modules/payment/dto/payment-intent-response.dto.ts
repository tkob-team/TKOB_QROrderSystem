import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export class PaymentIntentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Order ID (null for subscription payments)',
    example: 'e8f9a0b1-2c3d-4e5f-6a7b-8c9d0e1f2a3b',
    required: false,
    nullable: true,
  })
  orderId: string | null;

  @ApiProperty({
    description: 'Payment amount in VND',
    example: 250000,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'VND',
  })
  currency: string;

  @ApiProperty({
    description: 'QR code content for VietQR',
    example: '00020101021238570010A000000727012700069704220114706012345678900208QRIBFTTA53037045802VN62150811Order1234630445B5',
  })
  qrContent: string;

  @ApiProperty({
    description: 'Deep link to banking app',
    example: 'vietqr://payment?amount=250000&account=1234567890',
    required: false,
  })
  deepLink?: string;

  @ApiProperty({
    description: 'Transfer content/description',
    example: 'DH123456',
  })
  transferContent: string;

  @ApiProperty({
    description: 'Bank account number to transfer to',
    example: '1234567890',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'Bank code',
    example: 'VCB',
  })
  bankCode: string;

  @ApiProperty({
    description: 'SePay QR image URL for display',
    example: 'https://qr.sepay.vn/img?acc=1234567890&bank=Vietcombank&amount=250000&des=DH123456',
    required: false,
  })
  qrCodeUrl?: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Payment expiration time',
    example: '2026-01-11T06:00:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Payment creation time',
    example: '2026-01-11T05:45:00.000Z',
  })
  createdAt: Date;
}
