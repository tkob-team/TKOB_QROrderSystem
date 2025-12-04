import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Lùi ra 1 cấp (..) để tìm file .env ở apps/api/
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'fallback_database_url',
  },
});