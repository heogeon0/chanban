# ============================================
# Stage 1: Base
# ============================================
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# ============================================
# Stage 2: Pruner - 모노레포에서 api만 추출
# ============================================
FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo prune api --docker

# ============================================
# Stage 3: Builder
# ============================================
FROM base AS builder
WORKDIR /app

# 의존성 설치 (캐싱 최적화)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# 소스 복사 및 빌드
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=api

# ============================================
# Stage 4: Runner
# ============================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 보안: non-root 유저 사용
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

# 빌드 결과물만 복사
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./app_node_modules

EXPOSE 3001

CMD ["node", "dist/main.js"]
