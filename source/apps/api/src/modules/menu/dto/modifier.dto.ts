import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModifierType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ModifierOptionDto {
  @ApiPropertyOptional({ example: 'opt_1' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'Small' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: -10000 })
  @IsNumber()
  priceDelta: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  displayOrder: number;
}

export class CreateModifierGroupDto {
  @ApiProperty({ example: 'Size' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Choose your preferred size' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: ModifierType, example: 'SINGLE_CHOICE' })
  @IsEnum(ModifierType)
  type: ModifierType;

  @ApiProperty({ example: true })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minChoices?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  maxChoices?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  displayOrder?: number;

  @ApiProperty({
    type: [ModifierOptionDto],
    example: [
      { name: 'Small', priceDelta: -10000, displayOrder: 1 },
      { name: 'Medium', priceDelta: 0, displayOrder: 2 },
      { name: 'Large', priceDelta: 15000, displayOrder: 3 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierOptionDto)
  options: ModifierOptionDto[];
}

export class UpdateModifierGroupDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: ModifierType })
  @IsEnum(ModifierType)
  @IsOptional()
  type?: ModifierType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minChoices?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  maxChoices?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  active?: boolean;

  @ApiPropertyOptional({ type: [ModifierOptionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ModifierOptionDto)
  options?: ModifierOptionDto[];
}
