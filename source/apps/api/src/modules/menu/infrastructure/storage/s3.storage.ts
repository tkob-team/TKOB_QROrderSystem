import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '@config/env.validation';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import type {
  StorageService,
  UploadOptions,
  UploadResult,
  FileMetadata,
} from './storage.interface';

/**
 * S3 Storage Implementation
 *
 * Stores files on AWS S3 (production)
 * Implements same interface as LocalStorageService
 */
@Injectable()
export class S3StorageService implements StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly bucketUrl: string;
  private readonly cloudFrontUrl?: string;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    // Initialize S3 Client
    this.s3Client = new S3Client({
      region: this.config.get('AWS_REGION', { infer: true }),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID', { infer: true }),
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY', { infer: true }),
      },
    });

    this.bucketName = this.config.get('AWS_S3_BUCKET_NAME', { infer: true });
    this.bucketUrl = this.config.get('AWS_S3_BUCKET_URL', { infer: true }) || '';
    this.cloudFrontUrl = this.config.get('AWS_CLOUDFRONT_URL', { infer: true });

    this.logger.log(`S3 storage initialized: Bucket=${this.bucketName}`);
  }

  /**
   * Upload file to S3
   */
  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: options.key,
        Body: buffer,
        ContentType: options.contentType,
        Metadata: options.metadata,
      });

      const response = await this.s3Client.send(command);

      const url = this.buildPublicUrl(options.key);

      this.logger.debug(`File uploaded to S3: ${options.key}`);

      return {
        key: options.key,
        url,
        size: buffer.length,
        etag: response.ETag,
      };
    } catch (error) {
      this.logger.error('Failed to upload to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Delete file from S3
   */
  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.debug(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error('Failed to delete from S3:', error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  /**
   * Check if file exists in S3
   */
  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata from S3
   */
  async getMetadata(key: string): Promise<FileMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
        lastModified: response.LastModified || new Date(),
        metadata: response.Metadata,
      };
    } catch {
      return null;
    }
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Build public URL for S3 object
   * Priority: CloudFront > S3 Bucket URL
   */
  private buildPublicUrl(key: string): string {
    if (this.cloudFrontUrl) {
      return `${this.cloudFrontUrl}/${key}`;
    }
    return `${this.bucketUrl}/${key}`;
  }

  /**
   * Extract S3 key from URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      // Handle CloudFront URL
      if (this.cloudFrontUrl && url.startsWith(this.cloudFrontUrl)) {
        return url.replace(`${this.cloudFrontUrl}/`, '');
      }

      // Handle S3 Bucket URL
      if (url.startsWith(this.bucketUrl)) {
        return url.replace(`${this.bucketUrl}/`, '');
      }

      return null;
    } catch {
      return null;
    }
  }
}
