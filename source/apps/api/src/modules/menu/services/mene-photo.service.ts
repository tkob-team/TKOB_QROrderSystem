// apps/api/src/modules/menu/application/menu-photo.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '@config/env.validation';
import type { StorageService } from '../infrastructure/storage/storage.interface';
import { STORAGE_SERVICE } from '../infrastructure/storage/storage.interface';
import { MenuItemPhotoResponseDto } from '../dto/menu-photo.dto';
import * as crypto from 'crypto';
import * as path from 'path';

/**
 * Menu Photo Service (Application Layer)
 *
 * Clean Architecture principles:
 * - NO filesystem operations (fs)
 * - NO S3-specific code
 * - ONLY depends on StorageService interface
 * - Business logic independent of infrastructure
 *
 * Storage implementation can be swapped via DI:
 * - LocalStorageService (development)
 * - S3StorageService (production)
 */
@Injectable()
export class MenuPhotoService {
  private readonly logger = new Logger(MenuPhotoService.name);
  private readonly allowedMimeTypes: string[];
  private readonly maxFileSize: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<EnvConfig, true>,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {
    const mimeTypes = this.config.get('ALLOWED_MIME_TYPES', { infer: true });
    this.allowedMimeTypes = mimeTypes.split(',');
    this.maxFileSize = this.config.get('MAX_FILE_SIZE', { infer: true });
  }

  /**
   * Upload photo for menu item
   *
   * Flow:
   * 1. Validate file
   * 2. Verify menu item exists
   * 3. Generate storage key
   * 4. Upload via StorageService (abstraction)
   * 5. Save metadata to database
   */
  async uploadPhoto(
    menuItemId: string,
    file: Express.Multer.File,
  ): Promise<MenuItemPhotoResponseDto> {
    // 1. Validate file
    this.validateFile(file);

    // 2. Verify menu item exists
    const item = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    try {
      // 3. Generate object key (storage-agnostic)
      const key = this.generateObjectKey(menuItemId, file.originalname);

      // 4. Upload via StorageService (NO KNOWLEDGE of local/S3)
      const uploadResult = await this.storage.upload(file.buffer, {
        key,
        contentType: file.mimetype,
        metadata: {
          menuItemId,
          tenantId: item.tenantId,
          originalName: file.originalname,
        },
      });

      // 5. Save to database
      const photo = await this.prisma.menuItemPhoto.create({
        data: {
          menuItemId,
          url: uploadResult.url, // URL from storage (local or S3)
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          displayOrder: await this.getNextDisplayOrder(menuItemId),
          isPrimary: false,
        },
      });

      // 6. If first photo, set as primary
      const photoCount = await this.prisma.menuItemPhoto.count({
        where: { menuItemId },
      });

      if (photoCount === 1) {
        await this.setPrimaryPhoto(menuItemId, photo.id);
      }

      this.logger.log(`Photo uploaded: ${uploadResult.key} for menu item ${menuItemId}`);

      return this.toResponseDto(photo);
    } catch (error) {
      this.logger.error('Failed to upload photo:', error);
      throw new BadRequestException('Failed to upload photo');
    }
  }

  /**
   * Upload multiple photos (bulk upload)
   */
  async uploadPhotos(
    menuItemId: string,
    files: Express.Multer.File[],
  ): Promise<MenuItemPhotoResponseDto[]> {
    // 1. Validate menu item
    const item = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    // 2. Validate all files
    for (const file of files) {
      this.validateFile(file);
    }

    // 3. Get starting display order
    let displayOrder = await this.getNextDisplayOrder(menuItemId);

    // 4. Check if first upload
    const existingPhotoCount = await this.prisma.menuItemPhoto.count({
      where: { menuItemId },
    });
    const isFirstUpload = existingPhotoCount === 0;

    // 5. Upload all files
    const uploadedPhotos: MenuItemPhotoResponseDto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Generate key
        const key = this.generateObjectKey(menuItemId, file.originalname);

        // Upload via StorageService
        const uploadResult = await this.storage.upload(file.buffer, {
          key,
          contentType: file.mimetype,
          metadata: {
            menuItemId,
            tenantId: item.tenantId,
          },
        });

        // Save to database
        const photo = await this.prisma.menuItemPhoto.create({
          data: {
            menuItemId,
            url: uploadResult.url,
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            displayOrder: displayOrder++,
            isPrimary: isFirstUpload && i === 0,
          },
        });

        uploadedPhotos.push(this.toResponseDto(photo));
      } catch (error) {
        this.logger.error(`Failed to upload ${file.originalname}:`, error);
      }
    }

    // 6. Update menu item's primary photo
    if (isFirstUpload && uploadedPhotos.length > 0) {
      const firstPhoto = uploadedPhotos[0];
      await this.prisma.menuItem.update({
        where: { id: menuItemId },
        data: {
          imageUrl: firstPhoto.url,
          primaryPhotoId: firstPhoto.id,
        },
      });
    }

    return uploadedPhotos;
  }

  /**
   * Get all photos for menu item
   */
  async getPhotos(menuItemId: string): Promise<MenuItemPhotoResponseDto[]> {
    const photos = await this.prisma.menuItemPhoto.findMany({
      where: { menuItemId },
      orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
    });

    return photos.map(this.toResponseDto);
  }

  /**
   * Set primary photo
   */
  async setPrimaryPhoto(menuItemId: string, photoId: string): Promise<void> {
    const photo = await this.prisma.menuItemPhoto.findFirst({
      where: { id: photoId, menuItemId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Unset all other primary photos
    await this.prisma.menuItemPhoto.updateMany({
      where: { menuItemId },
      data: { isPrimary: false },
    });

    // Set this photo as primary
    await this.prisma.menuItemPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true },
    });

    // Update menu item
    await this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        imageUrl: photo.url,
        primaryPhotoId: photoId,
      },
    });
  }

  /**
   * Delete photo
   *
   * Flow:
   * 1. Find photo in database
   * 2. Delete from storage (via StorageService)
   * 3. Delete from database
   * 4. Handle primary photo logic
   */
  async deletePhoto(menuItemId: string, photoId: string): Promise<void> {
    const photo = await this.prisma.menuItemPhoto.findFirst({
      where: { id: photoId, menuItemId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    try {
      // 1. Extract storage key from URL
      const key = this.extractKeyFromUrl(photo.url);
      if (key) {
        // 2. Delete from storage (NO KNOWLEDGE of local/S3)
        await this.storage.delete(key);
      }

      // 3. Delete from database
      await this.prisma.menuItemPhoto.delete({
        where: { id: photoId },
      });

      // 4. Handle primary photo logic
      if (photo.isPrimary) {
        const nextPhoto = await this.prisma.menuItemPhoto.findFirst({
          where: { menuItemId },
          orderBy: { displayOrder: 'asc' },
        });

        if (nextPhoto) {
          await this.setPrimaryPhoto(menuItemId, nextPhoto.id);
        } else {
          await this.prisma.menuItem.update({
            where: { id: menuItemId },
            data: { imageUrl: null, primaryPhotoId: null },
          });
        }
      }

      this.logger.log(`Photo deleted: ${photoId}`);
    } catch (error) {
      this.logger.error('Failed to delete photo:', error);
      throw new BadRequestException('Failed to delete photo');
    }
  }

  /**
   * Update photo display order
   */
  async updatePhotoOrder(menuItemId: string, photoId: string, displayOrder: number): Promise<void> {
    await this.prisma.menuItemPhoto.update({
      where: { id: photoId, menuItemId },
      data: { displayOrder },
    });
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Validate file (business rule)
   */
  private validateFile(file: Express.Multer.File): void {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File too large. Maximum: ${this.maxFileSize / 1024 / 1024}MB`);
    }
  }

  /**
   * Generate storage object key
   * Format: menu-photos/{date}/{randomName}.{ext}
   *
   * Key is storage-agnostic:
   * - Local: /uploads/menu-photos/2025-12-26/abc.jpg
   * - S3: s3://bucket/menu-photos/2025-12-26/abc.jpg
   */
  private generateObjectKey(menuItemId: string, originalFilename: string): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(originalFilename);

    return `menu-photos/${date}/${randomName}${ext}`;
  }

  /**
   * Extract storage key from URL
   * Works for both local and S3 URLs
   */
  private extractKeyFromUrl(url: string): string | null {
    // Try extracting from local URL pattern
    const localMatch = url.match(/\/uploads\/(.+)$/);
    if (localMatch) {
      return localMatch[1];
    }

    // Try extracting from S3 URL pattern
    const s3Match = url.match(/\/([^/]+\/[^/]+\/[^/]+\.[a-z]+)$/);
    if (s3Match) {
      return s3Match[1];
    }

    return null;
  }

  /**
   * Get next display order
   */
  private async getNextDisplayOrder(menuItemId: string): Promise<number> {
    const maxOrder = await this.prisma.menuItemPhoto.findFirst({
      where: { menuItemId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    return (maxOrder?.displayOrder ?? -1) + 1;
  }

  /**
   * Transform to response DTO
   */
  private toResponseDto = (photo: {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    displayOrder: number;
    isPrimary: boolean;
    createdAt: Date;
  }): MenuItemPhotoResponseDto => {
    return {
      id: photo.id,
      url: photo.url,
      filename: photo.filename,
      mimeType: photo.mimeType,
      size: photo.size,
      displayOrder: photo.displayOrder,
      isPrimary: photo.isPrimary,
      createdAt: photo.createdAt,
    };
  };
}
