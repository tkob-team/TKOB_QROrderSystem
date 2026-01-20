import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Rating from 1 to 5 stars', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Optional comment for the review' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Reviewer name (from customer profile)' })
  @IsOptional()
  @IsString()
  reviewerName?: string;
}

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderItemId: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  rating: number;

  @ApiPropertyOptional()
  comment?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Menu item name' })
  itemName?: string;

  @ApiPropertyOptional({ description: 'Reviewer display name (anonymized)' })
  reviewerName?: string;
}

export class OrderReviewSummaryDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty({ type: [ReviewResponseDto] })
  reviews: ReviewResponseDto[];

  @ApiProperty({ description: 'Average rating across all items' })
  averageRating: number;

  @ApiProperty({ description: 'Total number of reviews' })
  totalReviews: number;
}

export class MenuItemReviewStatsDto {
  @ApiProperty()
  menuItemId: string;

  @ApiProperty()
  menuItemName: string;

  @ApiProperty({ description: 'Average rating for this menu item' })
  averageRating: number;

  @ApiProperty({ description: 'Total number of reviews' })
  totalReviews: number;

  @ApiProperty({ description: 'Rating distribution (1-5)' })
  ratingDistribution: Record<number, number>;

  @ApiPropertyOptional({ description: 'List of individual reviews', type: [ReviewResponseDto] })
  reviews?: ReviewResponseDto[];
}

export class TenantReviewStatsDto {
  @ApiProperty({ description: 'Overall average rating' })
  overallRating: number;

  @ApiProperty({ description: 'Total reviews count' })
  totalReviews: number;

  @ApiProperty({ description: 'Reviews in last 30 days' })
  recentReviewsCount: number;

  @ApiProperty({ description: 'Top rated items', type: [MenuItemReviewStatsDto] })
  topRatedItems: MenuItemReviewStatsDto[];

  @ApiProperty({ description: 'Items needing improvement', type: [MenuItemReviewStatsDto] })
  lowRatedItems: MenuItemReviewStatsDto[];
}
