import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file (development only)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'fallback_database_url',
  },
});
