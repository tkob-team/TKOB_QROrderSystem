import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CartModifierDto } from './cart.dto';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ type: [CartModifierDto] })
  modifiers: CartModifierDto[];

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  itemTotal: number;

  @ApiProperty()
  prepared: boolean;

  @ApiPropertyOptional()
  preparedAt: Date;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  tableId: string;

  @ApiProperty()
  tableNumber: string;

  @ApiProperty()
  customerName?: string;

  @ApiProperty()
  customerNotes?: string;

  @ApiProperty()
  status: string;

  @ApiProperty({
    enum: ['NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
  })
  priority: string;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiPropertyOptional({ description: 'Estimated preparation time in minutes' })
  estimatedPrepTime?: number;

  @ApiPropertyOptional({ description: 'Actual preparation time in minutes' })
  actualPrepTime?: number;

  @ApiPropertyOptional({ description: 'Time elapsed since order started preparing (minutes)' })
  elapsedPrepTime?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  receivedAt?: Date;

  @ApiProperty({ required: false })
  preparingAt?: Date;

  @ApiProperty({ required: false })
  readyAt?: Date;

  @ApiProperty({ required: false })
  servedAt?: Date;

  @ApiProperty({ required: false })
  completedAt?: Date;

  // stripePaymentIntentId?: string;

  // @ApiProperty()
  // clientSecret?: string; // For Stripe payment
}
