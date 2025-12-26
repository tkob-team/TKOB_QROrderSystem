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

export class PublicMenuResponseDto {
  @ApiProperty({ type: [MenuCategoryResponseDto] })
  categories: Array<
    MenuCategoryResponseDto & {
      items: MenuItemResponseDto[];
    }
  >;

  @ApiProperty()
  publishedAt: Date;
}
