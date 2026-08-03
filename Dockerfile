# ---- Зависимости ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# ---- Сборка ----
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma client генерируется до сборки: модули импортируют @prisma/client.
RUN npx prisma generate
RUN BUILD_STANDALONE=true npm run build

# ---- Продакшен ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# migrate deploy и db seed выполняются при старте контейнера, поэтому
# в образе нужны схема, seed-скрипт и полный node_modules (prisma CLI + tsx).
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Том с загрузками монтируется сюда: каталог должен принадлежать node.
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads

USER node
EXPOSE 3000
CMD ["node", "server.js"]
