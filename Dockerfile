# Multi-stage Docker build for Trà Duyên v1
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/content/package.json ./packages/content/
COPY packages/game-domain/package.json ./packages/game-domain/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
# Configure PostgreSQL Prisma schema for production deployment
RUN cp apps/server/prisma/schema.postgresql.prisma apps/server/prisma/schema.prisma
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/server ./apps/server
COPY --from=builder /app/apps/web/dist ./apps/web/dist

EXPOSE 3001
CMD ["pnpm", "--filter", "@tra-duyen/server", "start"]
