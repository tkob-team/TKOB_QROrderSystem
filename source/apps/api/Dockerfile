# ======================
# Stage 1: Dependencies
# ======================
FROM node:20-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

# Install necessary build tools for native dependencies (bcrypt, etc.)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY source/apps/api/package.json ./source/apps/api/
COPY source/packages ./source/packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# ======================
# Stage 2: Builder
# ======================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/source ./source

# Copy source code
COPY source/apps/api ./source/apps/api

# Generate Prisma Client
WORKDIR /app/source/apps/api
RUN pnpm prisma generate --config=./prisma/prisma.config.ts

# Build the application
RUN pnpm build

# ======================
# Stage 3: Runner
# ======================
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api/prisma ./prisma

# Copy migration files
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api/prisma/migrations ./prisma/migrations

USER nestjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command with migration
CMD ["sh", "-c", "pnpm prisma migrate deploy --config=./prisma/prisma.config.ts && node dist/main"]
