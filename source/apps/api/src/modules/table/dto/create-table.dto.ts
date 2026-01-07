import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateTableDto {
  @ApiProperty({
    example: 'Table 1',
    description: 'Table number/name (unique per tenant)',
  })
  @IsString()
  @MinLength(1, { message: 'Table number must have at least 1 character' })
  @MaxLength(50, { message: 'Table number cannot exceed 50 characters' })
  tableNumber: string;

  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 20,
    description: 'Number of seats (1-20)',
  })
  @IsInt()
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(20, { message: 'Capacity cannot exceed 20' })
  capacity: number;

  @ApiPropertyOptional({
    example: 'Main Hall',
    description: 'Table location/zone',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({
    example: 'Window table with city view',
    description: 'Additional description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Display order for sorting',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
