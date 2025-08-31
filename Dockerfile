# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Prisma/Node need these on Alpine
RUN apk add --no-cache openssl libc6-compat

# Install deps first for better caching
COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Build the app
COPY tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

# Only what needs to run
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY package.json ./

# Run DB migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
