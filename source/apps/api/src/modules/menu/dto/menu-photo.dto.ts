import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUrl,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class UploadPhotoDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class UpdatePhotoDto {
  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number;
}

export class MenuItemPhotoResponseDto {
  @ApiProperty({
    type: String,
    example: 'photo_123',
    description: 'Menu photo ID',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/photo.jpg',
    description: 'Menu photo URL',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    type: String,
    example: 'photo.jpg',
    description: 'Photo file name',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    type: String,
    example: 'image/jpeg',
    description: 'Photo MIME type',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    type: Number,
    example: 204800,
    description: 'Photo file size (bytes)',
  })
  @IsNumber()
  size: number;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Photo display order',
  })
  @IsNumber()
  displayOrder: number;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Is primary menu photo',
  })
  @IsBoolean()
  isPrimary: boolean;

  @ApiProperty({
    type: Date,
    example: '2025-12-22T10:00:00.000Z',
    description: 'Photo creation time',
  })
  @IsDate()
  @IsOptional()
  createdAt: Date;
}
