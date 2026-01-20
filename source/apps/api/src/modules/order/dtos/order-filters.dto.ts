import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsIn, IsEnum } from 'class-validator';
import { Type, Transform, Expose } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class OrderFiltersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by order status (can be single value or array)',
    type: [String],
    enum: OrderStatus,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value, obj }) => {
    // Handle multiple query param formats:
    // 1. status[]=VALUE (bracket notation - parsed as 'status[]' property)
    // 2. status=VALUE1,VALUE2 (comma-separated)
    // 3. status=VALUE&status=VALUE2 (repeated param)
    const raw = value ?? obj?.['status[]'];
    if (!raw) return undefined;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') return raw.split(',').map(s => s.trim());
    return raw;
  })
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  status?: OrderStatus[];

  // Accept 'status[]' bracket notation from frontend and merge into status
  @IsOptional()
  @Transform(() => undefined) // Always transform to undefined - value is merged into 'status'
  'status[]'?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tableId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'orderNumber', 'status', 'total'],
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  @IsIn(['createdAt', 'orderNumber', 'status', 'total'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
