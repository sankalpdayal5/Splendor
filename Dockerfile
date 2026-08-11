# Stage 1: Build Frontend SPA & Bundle Standalone Node Server
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build Vite static assets & bundle Express + Socket.io server into dist/server.js
RUN npm run build:client && \
    npx esbuild server/server.ts --bundle --platform=node --target=node20 --minify --outfile=dist/server.js

# Stage 2: Ultra-Lean Production Runner (< 65 MB Raw Image Size)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy bundled server & public static assets (0 node_modules needed!)
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 3000

# Native Node.js health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.js"]
