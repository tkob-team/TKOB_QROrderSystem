import {
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  IsArray,
  IsBoolean,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MenuItemStatus } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Spring Rolls' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Fresh vegetable spring rolls with sweet chili sauce' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'cat_1' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 15, minimum: 0, maximum: 240 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(240)
  preparationTime?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  chefRecommended?: boolean;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/spring-rolls.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: ['popular', 'vegetarian'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: ['gluten'] })
  @IsArray()
  @IsOptional()
  allergens?: string[];

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional({ example: ['mod_1', 'mod_2'] })
  @IsArray()
  @IsOptional()
  modifierGroupIds?: string[];
}

export class MenuItemFiltersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ enum: MenuItemStatus })
  @IsEnum(MenuItemStatus)
  @IsOptional()
  status?: MenuItemStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  available?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter chef recommendations only' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  chefRecommended?: boolean;

  @ApiPropertyOptional({
    enum: ['popularity', 'price', 'name', 'createdAt'],
    description: 'Sort field',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'popularity' | 'price' | 'name' | 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(240)
  preparationTime?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  chefRecommended?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  allergens?: string[];

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  modifierGroupIds?: string[];
}

export class PublishMenuItemDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  publish: boolean;
}

export class ToggleAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  available: boolean;
}
