FROM mcr.microsoft.com/playwright:v1.57.0-jammy

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Install Deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scraper/package.json ./scraper/
RUN pnpm install --frozen-lockfile --filter scraper...

# Copy & Build
COPY scraper ./scraper
WORKDIR /app/scraper
RUN pnpm build

# Permissions
RUN mkdir -p /app/data && chmod 777 /app/data

CMD ["node", "dist/index.js"]
