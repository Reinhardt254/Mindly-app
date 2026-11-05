# Build from the repo root. Coolify can use this Dockerfile with the base directory left empty.
FROM node:24-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate && npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY server/package.json ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/src/main.js"]
