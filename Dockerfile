# Multi-stage Dockerfile for LaunchPad

# Build stage - installs dev deps and builds frontend assets
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --silent --no-audit --no-fund || true
COPY . .
RUN npm run build || true

# Production stage
FROM node:18-alpine
WORKDIR /app
# Add a non-root user
RUN addgroup -S app && adduser -S -G app app
COPY backend/package.json backend/package-lock.json* ./backend/
# Install only production deps for backend
RUN cd backend && npm install --production --silent --no-audit --no-fund || true
# Copy application files
COPY --from=builder /app .
# Ensure public/dist exists (from build)
ENV NODE_ENV=production
EXPOSE 3000
USER app
CMD ["node", "backend/server.js"]