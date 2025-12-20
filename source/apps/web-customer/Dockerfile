# ======================
# Stage 1: Dependencies
# ======================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY source/apps/web-customer/package.json ./source/apps/web-customer/
COPY source/packages ./source/packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# ======================
# Stage 2: Builder
# ======================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/source ./source

# Copy source code
COPY source/apps/web-customer ./source/apps/web-customer

WORKDIR /app/source/apps/web-customer

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NODE_ENV=production

# Build the Next.js app
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
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder --chown=nextjs:nodejs /app/source/apps/web-customer/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/source/apps/web-customer/.next/static ./source/apps/web-customer/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/source/apps/web-customer/public ./source/apps/web-customer/public

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 0

CMD ["node", "source/apps/web-customer/server.js"]
