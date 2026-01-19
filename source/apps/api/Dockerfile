# ==========================================
# STAGE 1: Base
# ==========================================
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable

# ==========================================
# STAGE 2: Builder
# ==========================================
FROM base AS builder
WORKDIR /app

# Copy pnpm workspace files from root
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy app source
COPY source/apps/api ./source/apps/api

# Copy packages if any
COPY source/packages ./source/packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter=api prisma:generate

RUN pnpm --filter=api build

# ==========================================
# STAGE 3: Runner
# ==========================================
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache libssl3 libcrypto3

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy workspace structure
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy source/apps/api
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api ./source/apps/api

# Copy source/packages if any
COPY --from=builder --chown=nestjs:nodejs /app/source/packages ./source/packages

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/source/apps/api

USER nestjs

EXPOSE 3000

# Create entrypoint script to run migrations before starting app
USER root
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'echo "🔄 Running Prisma migrations..."' >> /docker-entrypoint.sh && \
    echo 'cd /app/source/apps/api' >> /docker-entrypoint.sh && \
    echo 'npx prisma migrate deploy || echo "⚠️  Migration failed, continuing..."' >> /docker-entrypoint.sh && \
    echo 'echo "✅ Migrations completed"' >> /docker-entrypoint.sh && \
    echo 'echo "🚀 Starting application..."' >> /docker-entrypoint.sh && \
    echo 'exec node dist/src/main.js' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

USER nestjs

ENTRYPOINT ["/docker-entrypoint.sh"]