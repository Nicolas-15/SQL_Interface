FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN npm install -g pnpm && npm cache clean --force
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile && pnpm store prune

FROM base AS build
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY . .
RUN pnpm run build

FROM node:20-alpine AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
    
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]