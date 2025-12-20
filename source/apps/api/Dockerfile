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

# Enable hoisting for Docker (simpler module resolution)
RUN echo "shamefully-hoist=true" > .npmrc

# Install dependencies with build scripts enabled for native modules
RUN pnpm install --frozen-lockfile --ignore-scripts=false

# ======================
# Stage 2: Builder
# ======================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy workspace files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/source ./source

# Copy source code
COPY source/apps/api ./source/apps/api

# Generate Prisma Client (run from app directory, prisma is hoisted to /app/node_modules)
WORKDIR /app/source/apps/api
RUN node /app/node_modules/prisma/build/index.js generate --schema=./prisma/schema.prisma

# Build the application
RUN node /app/node_modules/@nestjs/cli/bin/nest.js build

# Debug: List contents to verify dist location
RUN ls -la && ls -la dist/

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

# Copy workspace files (needed for pnpm)
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy node_modules from root (includes Prisma CLI and generated client)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy source structure to maintain relative paths
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api/dist ./source/apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api/package.json ./source/apps/api/package.json
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api/prisma ./source/apps/api/prisma
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api/start.sh ./source/apps/api/start.sh

# Make start script executable
RUN chmod +x ./source/apps/api/start.sh

# Set working directory to match build structure
WORKDIR /app/source/apps/api

USER nestjs

ENV NODE_ENV=production
# Don't set PORT here - let Render set it automatically

# Start command - run migrations then start app
CMD ["./start.sh"]
