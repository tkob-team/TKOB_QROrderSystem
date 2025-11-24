// src/config/env.validation.ts
import { z } from 'zod';

// 1. Định nghĩa Schema
export const envSchema = z.object({
  // Node Environment: Force về 1 trong 3 giá trị, default là development
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // API Config
  // Lưu ý: .env luôn là string, nên ta phải dùng z.coerce.number() để ép kiểu sang số
  API_PORT: z.coerce.number().min(1000).max(65535).default(3000),
  
  // Database Config (Dựa trên SETUP.md)
  DATABASE_URL: z.string().url({ message: "Invalid Database URL format" }),
  
  // Auth Config
  JWT_SECRET: z.string().min(32, { message: "JWT Secret must be at least 32 chars" }),
  JWT_EXPIRES_IN: z.string().default('1h'),
  
  // Redis (Optional example)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
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