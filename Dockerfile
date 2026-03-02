FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
# Reuse generated Prisma client from builder (avoids needing prisma CLI here)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy prisma CLI from builder for migrate deploy (avoids npx downloading it on every start)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma/engines ./node_modules/@prisma/engines

COPY --from=builder /app/dist ./dist
COPY src/i18n ./src/i18n

USER app

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
