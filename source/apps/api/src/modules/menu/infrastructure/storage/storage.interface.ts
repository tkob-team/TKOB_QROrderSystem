/**
 * Storage Service Port (Interface)
 *
 * Clean Architecture principle:
 * - Domain/Application layer ONLY depends on this interface
 * - Infrastructure implementations (Local, S3) implement this interface
 * - Easy to swap implementations without changing business logic
 */
export interface StorageService {
  /**
   * Upload file to storage
   * @param buffer - File buffer (domain-level, no filesystem dependency)
   * @param options - Upload options
   * @returns Public URL to access the file
   */
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;

  /**
   * Delete file from storage
   * @param key - Object identifier (not filesystem path)
   */
  delete(key: string): Promise<void>;

  /**
   * Check if file exists
   * @param key - Object identifier
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get file metadata
   * @param key - Object identifier
   */
  getMetadata(key: string): Promise<FileMetadata | null>;
}

/**
 * Upload options (storage-agnostic)
 */
export interface UploadOptions {
  /** Object key (e.g., 'menu-photos/2025-12-26/abc123.jpg') */
  key: string;

  /** Content type (e.g., 'image/jpeg') */
  contentType: string;

  /** Optional metadata */
  metadata?: Record<string, string>;

  /** Access control (public/private) */
  // acl?: 'public-read' | 'private';
}

/**
 * Upload result
 */
export interface UploadResult {
  /** Object key */
  key: string;

  /** Public URL to access file */
  url: string;

  /** File size in bytes */
  size: number;

  /** ETag or hash */
  etag?: string;
}

/**
 * File metadata
 */
export interface FileMetadata {
  /** File size in bytes */
  size: number;

  /** Content type */
  contentType: string;

  /** Last modified date */
  lastModified: Date;

  /** Custom metadata */
  metadata?: Record<string, string>;
}

/**
 * Storage Service Token (for DI)
 */
export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
