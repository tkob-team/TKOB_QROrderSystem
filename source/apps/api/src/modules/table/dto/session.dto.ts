import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO when scanning QR code
 */
export class ScanQrResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Table ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tableId: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Table number',
    example: 'A1',
  })
  tableNumber: string;

  @ApiProperty({
    description: 'Redirect URL',
    example: '/menu',
  })
  redirectUrl: string;
}

/**
 * Session info DTO
 */
export class SessionInfoDto {
  @ApiProperty({
    description: 'Session ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Table ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tableId: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Table number',
    example: 'A1',
  })
  tableNumber: string;

  @ApiProperty({
    description: 'Time when QR was scanned',
    example: '2025-12-18T11:00:00.000Z',
  })
  scannedAt: Date;
}

/**
 * Clear table response DTO
 */
export class ClearTableResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Table cleared successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Table ID that was cleared',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tableId: string;

  @ApiProperty({
    description: 'Time when table was cleared',
    example: '2025-12-18T14:00:00.000Z',
  })
  clearedAt: Date;

  @ApiProperty({
    description: 'Staff user ID who cleared the table',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  clearedBy: string;
}

/**
 * Active session item DTO (for monitoring)
 */
export class ActiveSessionDto {
  @ApiProperty({
    description: 'Session ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Table ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tableId: string;

  @ApiProperty({
    description: 'Time when QR was scanned',
    example: '2025-12-18T11:00:00.000Z',
  })
  scannedAt: Date;

  @ApiProperty({
    description: 'Session is active',
    example: true,
  })
  active: boolean;
}
