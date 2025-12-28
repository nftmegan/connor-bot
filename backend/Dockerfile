FROM node:22-bookworm-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy Workspace Configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY scraper/package.json ./scraper/

# Install Deps (Frozen)
RUN pnpm install --frozen-lockfile

# Copy Source & Build
COPY backend ./backend
COPY frontend ./frontend
WORKDIR /app/backend
RUN pnpm build

# Runner Stage
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json

RUN mkdir -p /app/data && chown -R node:node /app
USER node

CMD ["node", "dist/index.js"]
