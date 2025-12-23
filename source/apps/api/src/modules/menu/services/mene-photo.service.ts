import { PrismaService } from '@/database/prisma.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { MenuItemPhotoResponseDto } from '../dto/menu-photo.dto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class MenuPhotoService {
  private uploadDir: string;
  private readonly logger = new Logger(MenuPhotoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    // In production, use S3/Cloudinary. For now, local storage
    this.uploadDir = path.join(process.cwd(), 'uploads', 'menu-photos');
    void this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${error}`);
    }
  }

  async uploadPhoto(
    menuItemId: string,
    file: Express.Multer.File,
  ): Promise<MenuItemPhotoResponseDto> {
    // 1. Validate file
    this.validateFile(file);

    // 2. Verify menu item exists
    const item = await this.prisma.menuItem.findUnique({
      where: {
        id: menuItemId,
      },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    // 3. Generate safe filename
    const ext = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    const filename = `${randomName}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    // 4. Savefile
    await fs.writeFile(filePath, file.buffer);

    // 5. Get image dimensions (optional, requires sharp package)
    // const metadata = await sharp(file.buffer).metadata();

    // 6. Create photo record
    const photo = await this.prisma.menuItemPhoto.create({
      data: {
        menuItemId,
        url: `/uploads/menu-photos/${filename}`, // In prod: S3 URL
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        displayOrder: await this.getNextDisplayOrder(menuItemId),
        isPrimary: false,
      },
    });

    // 7. If this is the first photo, set as primary
    const photoCount = await this.prisma.menuItemPhoto.count({
      where: {
        menuItemId,
      },
    });

    if (photoCount == 1) {
      await this.setPrimaryPhoto(menuItemId, photo.id);
    }

    return this.toResponseDto(photo);
  }

  async uploadPhotos(
    menuItemId: string,
    files: Express.Multer.File[],
  ): Promise<MenuItemPhotoResponseDto[]> {
    // 1. Validate menu item exists
    const item = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    // 2. Validate all files first (fail fast)
    for (const file of files) {
      this.validateFile(file);
    }

    // 3. Get starting display order
    let displayOrder = await this.getNextDisplayOrder(menuItemId);

    // 4. Check if this is first upload
    const existingPhotoCount = await this.prisma.menuItemPhoto.count({
      where: { menuItemId },
    });
    const isFirstUpload = existingPhotoCount === 0;

    // 5. Process all files
    const uploadedPhotos: MenuItemPhotoResponseDto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Generate filename
      const ext = path.extname(file.originalname);
      const randomName = crypto.randomBytes(16).toString('hex');
      const filename = `${randomName}${ext}`;
      const filePath = path.join(this.uploadDir, filename);

      // Save file
      await fs.writeFile(filePath, file.buffer);

      // Create photo record
      const photo = await this.prisma.menuItemPhoto.create({
        data: {
          menuItemId,
          url: `/uploads/menu-photos/${filename}`,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          displayOrder: displayOrder++,
          isPrimary: isFirstUpload && i === 0, // First photo of first upload = primary
        },
      });

      uploadedPhotos.push(this.toResponseDto(photo));
    }

    // 6. If first photo was uploaded, update menu item
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

  toResponseDto(photo: {
    id: string;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
    isPrimary: boolean;
    menuItemId: string;
  }): MenuItemPhotoResponseDto {
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
  }

  async setPrimaryPhoto(menuItemId: string, photoId: string): Promise<void> {
    const photo = await this.prisma.menuItemPhoto.findFirst({
      where: {
        id: photoId,
        menuItemId: menuItemId,
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Unset all other primary photo
    await this.prisma.menuItemPhoto.updateMany({
      where: { menuItemId },
      data: {
        isPrimary: false,
      },
    });

    // Set this photo as primary
    await this.prisma.menuItemPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true },
    });

    /// Update menu item's primaryPhotoId
    await this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        imageUrl: photo.url,
        primaryPhotoId: photoId,
      },
    });
  }

  private async getNextDisplayOrder(menuItemId: string): Promise<number> {
    const maxOrder = await this.prisma.menuItemPhoto.findFirst({
      where: { menuItemId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    return (maxOrder?.displayOrder ?? -1) + 1;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  async getPhotos(menuItemId: string): Promise<MenuItemPhotoResponseDto[]> {
    const photos = await this.prisma.menuItemPhoto.findMany({
      where: { menuItemId: menuItemId },
      orderBy: [
        {
          isPrimary: 'desc',
        },
        {
          displayOrder: 'asc',
        },
      ],
    });

    return photos.map((photo) => this.toResponseDto(photo));
  }

  async updatePhotoOrder(menuItemId: string, photoId: string, displayOrder: number): Promise<void> {
    await this.prisma.menuItemPhoto.update({
      where: {
        menuItemId,
        id: photoId,
      },
      data: { displayOrder },
    });
  }

  async deletePhoto(menuItemId: string, photoId: string): Promise<void> {
    const photo = await this.prisma.menuItemPhoto.findFirst({
      where: { id: photoId, menuItemId },
    });

    if (!photo) {
      throw new NotFoundException('Photo Not Found');
    }

    try {
      const filePath = path.join(process.cwd(), photo.url);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error}`);
    }

    // Delete from database
    await this.prisma.menuItemPhoto.delete({
      where: { id: photoId },
    });

    // If this was primary, set another photo as primary
    if (photo.isPrimary) {
      const nextPhoto = await this.prisma.menuItemPhoto.findFirst({
        where: { menuItemId },
        orderBy: { displayOrder: 'asc' },
      });

      if (nextPhoto) {
        await this.setPrimaryPhoto(menuItemId, nextPhoto.id);
        await this.prisma.menuItem.update({
          where: { id: menuItemId },
          data: { imageUrl: nextPhoto.url },
        });
      } else {
        await this.prisma.menuItem.update({
          where: { id: menuItemId },
          data: { primaryPhotoId: null, imageUrl: null },
        });
      }
    }
  }
}
