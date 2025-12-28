# --- Stage 1: Builder ---
FROM node:20-bookworm-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy Monorepo Configs first (for caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY scraper/package.json ./scraper/

# Install dependencies (frozen lockfile for speed/consistency)
RUN pnpm install --frozen-lockfile

# Copy Source Code
COPY backend ./backend
COPY frontend ./frontend

# Build Backend
WORKDIR /app/backend
RUN pnpm build


# --- Stage 2: Runner ---
FROM node:20-bookworm-slim AS runner

# Install system dependencies only if strictly needed for runtime
# (Removing heavyweight build tools to keep image small)
ENV NODE_ENV=production

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json

# Create data directory with correct permissions
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to non-root user
USER node

CMD ["node", "dist/index.js"]