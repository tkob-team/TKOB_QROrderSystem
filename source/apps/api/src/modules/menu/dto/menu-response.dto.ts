import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuItemPhotoResponseDto } from './menu-photo.dto';

export class MenuCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ModifierOptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  priceDelta: number;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  active: boolean;
}

export class ModifierGroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  required: boolean;

  @ApiProperty()
  minChoices: number;

  @ApiPropertyOptional()
  maxChoices?: number;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ type: [ModifierOptionResponseDto] })
  options: ModifierOptionResponseDto[];
}

export class MenuItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ example: 15, minimum: 0, maximum: 240 })
  preparationTime: number;

  @ApiProperty()
  chefRecommended?: boolean;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  available: boolean;

  @ApiPropertyOptional()
  tags?: string[];

  @ApiPropertyOptional()
  allergens?: string[];

  @ApiProperty()
  displayOrder: number;

  @ApiPropertyOptional({ type: MenuCategoryResponseDto })
  category?: MenuCategoryResponseDto;

  @ApiPropertyOptional({ type: [ModifierGroupResponseDto] })
  modifierGroups?: ModifierGroupResponseDto[];

  @ApiPropertyOptional({ type: [MenuItemPhotoResponseDto] })
  photos?: MenuItemPhotoResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  publishedAt?: Date;
}

export class PaginationMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  hasPrevious: boolean;
}

export class PublicMenuItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ type: MenuItemPhotoResponseDto })
  primaryPhoto?: MenuItemPhotoResponseDto;

  @ApiPropertyOptional({ type: [MenuItemPhotoResponseDto] })
  photos?: MenuItemPhotoResponseDto[];

  @ApiPropertyOptional()
  tags?: string[];

  @ApiPropertyOptional()
  allergens?: string[];

  @ApiProperty({ type: [ModifierGroupResponseDto] })
  modifierGroups: ModifierGroupResponseDto[];

  @ApiProperty()
  preparationTime: number;

  @ApiProperty()
  chefRecommended: boolean;

  @ApiProperty()
  popularity: number;

  @ApiProperty()
  displayOrder: number;
}

export class PublicMenuCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty({ type: [PublicMenuItemDto] })
  items: PublicMenuItemDto[];
}

export class PublicMenuResponseDto {
  @ApiProperty({ type: [PublicMenuCategoryDto] })
  categories: PublicMenuCategoryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;

  @ApiProperty()
  publishedAt: Date;
}
