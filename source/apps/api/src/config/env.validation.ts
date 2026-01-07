// src/config/env.validation.ts
import { z } from 'zod';

// 1. Định nghĩa Schema
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // API Config
    API_PORT: z.coerce.number().min(1000).max(65535).default(3000),

    // Database Config
    DATABASE_URL: z.string().url({ message: 'Invalid Database URL format' }),

    // JWT Config
    JWT_SECRET: z.string().min(32, { message: 'JWT Secret must be at least 32 chars' }),
    JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('1h'),
    JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

    // Redis Config - Support both REDIS_URL (Render) and individual vars (local)
    REDIS_URL: z.string().optional(), // Format: redis://default:password@host:port
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.coerce.number().default(0),

    // Email Config - Support multiple providers
    EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid']).default('smtp'),

    // SendGrid Config
    SENDGRID_API_KEY: z.string().optional(),

    // SMTP Config (legacy)
    EMAIL_HOST: z.string().optional(),
    EMAIL_PORT: z.coerce.number().optional(),
    EMAIL_SECURE: z.coerce.boolean().optional(),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),

    // Common
    EMAIL_FROM: z.string().default('QR Ordering <noreply@qr-ordering.com>'),

    // OTP Config
    OTP_LENGTH: z.coerce.number().default(6),
    OTP_EXPIRY_SECONDS: z.coerce.number().default(300),
    REGISTRATION_DATA_EXPIRY_SECONDS: z.coerce.number().default(600),

    // CORS
    CORS_ORIGINS: z.string().optional(),

    // Customer App URL (for QR codes)
    CUSTOMER_APP_URL: z.string().url().default('http://localhost:3000'),

    // ==================== STORAGE CONFIG ====================
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),

    // Upload Settings (always required)
    MAX_FILE_SIZE: z.coerce.number().default(5242880), // 5MB
    ALLOWED_MIME_TYPES: z.string().default('image/jpeg,image/png,image/webp'),

    // ==================== AWS S3 Config (optional, only when STORAGE_DRIVER=s3) ====================
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET_NAME: z.string().optional(),
    AWS_S3_BUCKET_URL: z.string().url().optional(),
    AWS_CLOUDFRONT_URL: z.string().url().optional(),
  })
  .refine(
    (data) => {
      // If S3 driver, AWS credentials are required
      if (data.STORAGE_DRIVER === 's3') {
        return (
          data.AWS_ACCESS_KEY_ID &&
          data.AWS_SECRET_ACCESS_KEY &&
          data.AWS_REGION &&
          data.AWS_S3_BUCKET_NAME
        );
      }
      return true;
    },
    {
      message: 'AWS credentials required when STORAGE_DRIVER=s3',
    },
  )
  .refine(
    (data) => {
      // Validate SendGrid config
      if (data.EMAIL_PROVIDER === 'sendgrid') {
        return !!data.SENDGRID_API_KEY;
      }
      // Validate SMTP config
      if (data.EMAIL_PROVIDER === 'smtp') {
        return !!data.EMAIL_HOST && !!data.EMAIL_USER && !!data.EMAIL_PASSWORD;
      }
      return true;
    },
    {
      message: 'Email provider configuration is incomplete',
    },
  );

// 2. Export Type tự động từ Schema (Magic của Zod)
export type EnvConfig = z.infer<typeof envSchema>;

// 3. Hàm validate custom để NestJS sử dụng
export function validate(config: Record<string, unknown>) {
  // safeParse sẽ không throw error ngay mà trả về object result
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment configuration');
  }

  // Trả về data đã được validate và transform (ép kiểu number, set default)
  return result.data;
}
