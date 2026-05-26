FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages/database ./packages/database
COPY apps/websocket ./apps/websocket

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @anitech/database prisma:generate
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN npm install -g pnpm

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json /app/tsconfig.json ./
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/node_modules/.prisma ./packages/database/node_modules/.prisma
COPY --from=builder /app/apps/websocket/package.json ./apps/websocket/
COPY --from=builder /app/apps/websocket/dist ./apps/websocket/dist
COPY --from=builder /app/apps/websocket/node_modules ./apps/websocket/node_modules
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4001

CMD ["node", "apps/websocket/dist/main.js"]