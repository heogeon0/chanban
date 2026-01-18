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

# pnpm deploy로 production 의존성만 추출 (심볼릭 링크 없이)
RUN pnpm deploy --filter=api --prod --legacy /prod/api

# ============================================
# Stage 4: Runner
# ============================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 보안: non-root 유저 사용
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

# pnpm deploy 결과물 복사 (node_modules + package.json)
COPY --from=builder --chown=nestjs:nodejs /prod/api .
# 빌드된 dist 폴더 별도 복사
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
