import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum MenuSortByEnum {
  POPULARITY = 'popularity',
  PRICE = 'price',
  NAME = 'name',
  DISPLAY_ORDER = 'displayOrder',
}

export enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export class PublicMenuFiltersDto {
  @ApiPropertyOptional({ description: 'Tenant ID (optional if session cookie provided)' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Search by item name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter chef recommended items only' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  chefRecommended?: boolean;

  @ApiPropertyOptional({ enum: MenuSortByEnum, default: MenuSortByEnum.DISPLAY_ORDER })
  @IsOptional()
  @IsEnum(MenuSortByEnum)
  sortBy?: MenuSortByEnum;

  @ApiPropertyOptional({ enum: SortOrderEnum, default: SortOrderEnum.ASC })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  sortOrder?: SortOrderEnum;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
