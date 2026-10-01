# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
COPY prisma/ ./prisma/
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/dist ./dist
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 4000

CMD ["node", "dist/main"]
