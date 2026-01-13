import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from './order-response.dto';

/**
 * KDS Orders Response - Categorized by priority
 */
export class KdsOrdersResponseDto {
  @ApiProperty({
    type: [OrderResponseDto],
    description: 'Orders within estimated time (<= 100%)',
  })
  normal: OrderResponseDto[];

  @ApiProperty({
    type: [OrderResponseDto],
    description: 'Orders exceeding estimated time (100-150%)',
  })
  high: OrderResponseDto[];

  @ApiProperty({
    type: [OrderResponseDto],
    description: 'Orders significantly delayed (> 150%)',
  })
  urgent: OrderResponseDto[];
}

/**
 * KDS Statistics Response
 */
export class KdsStatsResponseDto {
  @ApiProperty({
    example: 15,
    description: 'Total orders in PREPARING status',
  })
  totalActive: number;

  @ApiProperty({
    example: 2,
    description: 'Number of urgent orders (> 150% estimated time)',
  })
  urgent: number;

  @ApiProperty({
    example: 3,
    description: 'Number of high priority orders (100-150% estimated time)',
  })
  high: number;

  @ApiProperty({
    example: 10,
    description: 'Number of normal priority orders (<= 100% estimated time)',
  })
  normal: number;

  @ApiProperty({
    example: 12.5,
    description: 'Average preparation time in minutes',
    required: false,
  })
  avgPrepTime?: number;

  @ApiProperty({
    example: 45,
    description: 'Number of orders completed today',
    required: false,
  })
  todayCompleted?: number;
}
