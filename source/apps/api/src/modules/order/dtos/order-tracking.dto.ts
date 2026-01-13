import { ApiProperty } from '@nestjs/swagger';

/**
 * Order tracking timeline item
 * Represents a status checkpoint in order lifecycle
 */
export class OrderTimelineItemDto {
  @ApiProperty({
    example: 'RECEIVED',
    description: 'Order status checkpoint',
  })
  status: string;

  @ApiProperty({
    example: 'Order received',
    description: 'User-friendly status label',
  })
  label: string;

  @ApiProperty({
    example: '2025-01-10T10:00:00Z',
    description: 'Timestamp when this status was reached',
    required: false,
  })
  timestamp?: Date;

  @ApiProperty({
    example: true,
    description: 'Whether this checkpoint has been completed',
  })
  completed: boolean;

  @ApiProperty({
    example: 'Your order is being prepared by our kitchen',
    description: 'Detailed description for customer',
    required: false,
  })
  description?: string;
}

/**
 * Customer order tracking response
 * Simplified view for customer-facing order status
 */
export class CustomerOrderTrackingDto {
  @ApiProperty({ example: 'ord_123' })
  orderId: string;

  @ApiProperty({ example: 'ORD-20250110-0001' })
  orderNumber: string;

  @ApiProperty({ example: 'Table 5' })
  tableNumber: string;

  @ApiProperty({
    example: 'PREPARING',
    description: 'Current order status',
  })
  currentStatus: string;

  @ApiProperty({
    example: 'Your order is being prepared',
    description: 'User-friendly current status message',
  })
  currentStatusMessage: string;

  @ApiProperty({
    type: [OrderTimelineItemDto],
    description: 'Order status timeline',
  })
  timeline: OrderTimelineItemDto[];

  @ApiProperty({
    example: 15,
    description: 'Estimated time remaining (minutes)',
    required: false,
  })
  estimatedTimeRemaining?: number;

  @ApiProperty({
    example: 5,
    description: 'Time elapsed since order placed (minutes)',
  })
  elapsedMinutes: number;

  @ApiProperty({ example: '2025-01-10T10:00:00Z' })
  createdAt: Date;
}
