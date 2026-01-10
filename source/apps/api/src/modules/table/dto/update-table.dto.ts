import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { TableStatus } from '@prisma/client';

export class UpdateTableDto {
  @ApiPropertyOptional({
    example: 'Table 1A',
    description: 'Table number/name',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  tableNumber?: string;

  @ApiPropertyOptional({
    example: 6,
    minimum: 1,
    maximum: 20,
    description: 'Number of seats',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  capacity?: number;

  @ApiPropertyOptional({
    example: 'VIP Room',
    description: 'Table location/zone',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({
    example: 'Near window',
    description: 'Additional description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    enum: TableStatus,
    example: TableStatus.OCCUPIED,
    description: 'Table status',
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional({
    example: true,
    description: 'Active status (soft delete)',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Display order',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
