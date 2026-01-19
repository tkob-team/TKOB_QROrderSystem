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

COPY . .

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

# Copy TOÀN BỘ workspace structure (giữ nguyên cấu trúc pnpm)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy toàn bộ source/apps/api
COPY --from=builder --chown=nestjs:nodejs /app/source/apps/api ./source/apps/api

# Copy packages nếu có dependencies internal
COPY --from=builder --chown=nestjs:nodejs /app/source/packages ./source/packages

ENV NODE_ENV=production
ENV PORT=3000

# Chạy từ thư mục api
WORKDIR /app/source/apps/api

USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]