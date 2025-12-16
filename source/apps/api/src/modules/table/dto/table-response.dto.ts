import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TableStatus } from '@prisma/client';

export class TableResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  tenantId: string;

  @ApiProperty({ example: 'Table 1' })
  tableNumber: string;

  @ApiProperty({ example: 4 })
  capacity: number;

  @ApiPropertyOptional({ example: 'Main Hall' })
  location?: string;

  @ApiPropertyOptional({ example: 'Window table with city view' })
  description?: string;

  @ApiProperty({ enum: TableStatus, example: TableStatus.AVAILABLE })
  status: TableStatus;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: 0 })
  displayOrder: number;

  @ApiPropertyOptional({ 
    example: '/api/v1/admin/tables/123/qr/download',
    description: 'URL to download QR code' 
  })
  qrCodeUrl?: string;

  @ApiPropertyOptional({ 
    example: '2024-01-15T10:30:00.000Z',
    description: 'QR code generation timestamp' 
  })
  qrGeneratedAt?: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class RegenerateQrResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  tableId: string;

  @ApiProperty({ 
    example: 'eyJhbGc...signature',
    description: 'New QR token' 
  })
  qrToken: string;

  @ApiProperty({ 
    example: '/api/v1/admin/tables/123/qr/download',
    description: 'URL to download new QR code' 
  })
  qrCodeUrl: string;

  @ApiProperty({ 
    example: '2024-01-15T10:30:00.000Z',
    description: 'Generation timestamp' 
  })
  generatedAt: Date;
}
