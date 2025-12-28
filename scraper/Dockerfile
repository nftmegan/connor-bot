FROM node:20-bookworm

# Install Playwright & System Dependencies
RUN npx playwright install-deps chromium

WORKDIR /app

# Copy Config
COPY package.json tsconfig.json ./
RUN npm install

# Copy Source
COPY src ./src

# Build
RUN npm run build 2>/dev/null || true

# Start
CMD ["npx", "tsx", "src/index.ts"]
