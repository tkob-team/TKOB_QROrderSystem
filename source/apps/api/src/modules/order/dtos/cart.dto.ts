import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { MenuItemPhotoResponseDto } from '../../menu/dto/menu-photo.dto';

export class CartModifierInputDto {
  @ApiProperty({ example: 'adb1cd5a-6121-462d-97b1-e52bb8d84a97' })
  @IsString()
  groupId: string;

  @ApiProperty({ example: '33eeb203-db4b-49ca-bfb1-e3d03ef05fbd' })
  @IsString()
  optionId: string;
}

export class AddToCartDto {
  @ApiProperty({ example: 'item_123' })
  @IsString()
  menuItemId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ type: [CartModifierInputDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CartModifierInputDto)
  modifiers?: CartModifierInputDto[];

  @ApiPropertyOptional({ example: 'No ice please' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 1, minimum: 0 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 'No ice please' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CartModifierDto {
  @ApiProperty({ example: 'mod_123' })
  @IsString()
  groupId: string;

  @ApiProperty({ example: 'Size' })
  @IsString()
  groupName: string;

  @ApiProperty({ example: 'opt_456' })
  @IsString()
  optionId: string;

  @ApiProperty({ example: 'Large' })
  @IsString()
  optionName: string;

  @ApiProperty({ example: 10000 })
  @IsOptional()
  @IsNumber()
  priceDelta: number;
}

export class CartItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuItemId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ type: [CartModifierDto] })
  modifiers: CartModifierDto[];

  @ApiPropertyOptional({ type: MenuItemPhotoResponseDto })
  primaryPhoto?: MenuItemPhotoResponseDto;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  itemTotal: number; // (price + sum(modifiers)) * quantity
}

export class CartResponseDto {
  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ description: 'Subtotal before tax and service charge' })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount (based on tenant settings)' })
  tax: number;

  @ApiProperty({ description: 'Tax percentage rate' })
  taxRate: number;

  @ApiProperty({ description: 'Service charge amount (based on tenant settings)' })
  serviceCharge: number;

  @ApiProperty({ description: 'Service charge percentage rate' })
  serviceChargeRate: number;

  @ApiProperty({ description: 'Total = subtotal + tax + serviceCharge' })
  total: number;

  @ApiProperty()
  itemCount: number;
}
