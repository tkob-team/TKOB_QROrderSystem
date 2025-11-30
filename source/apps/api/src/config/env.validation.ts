// src/config/env.validation.ts
import { z } from 'zod';

// 1. Định nghĩa Schema
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // API Config
  API_PORT: z.coerce.number().min(1000).max(65535).default(3000),
  
  // Database Config
  DATABASE_URL: z.string().url({ message: "Invalid Database URL format" }),
  
  // JWT Config
  JWT_SECRET: z.string().min(32, { message: "JWT Secret must be at least 32 chars" }),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  
  // Redis Config
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  
  // Email Config
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_SECURE: z.coerce.boolean().default(false),
  EMAIL_USER: z.string().email(),
  EMAIL_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().default('QR Ordering <noreply@qr-ordering.com>'),
  
  // OTP Config
  OTP_LENGTH: z.coerce.number().default(6),
  OTP_EXPIRY_SECONDS: z.coerce.number().default(300),
  REGISTRATION_DATA_EXPIRY_SECONDS: z.coerce.number().default(600),
  
  // CORS
  CORS_ORIGINS: z.string().optional(),
});

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