ARG PLAYWRIGHT_VERSION=1.56.1
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble

WORKDIR /work

# Install deps first for better layer caching
COPY package.json package-lock.json* ./
# Browsers and OS deps are already in the base image; skip postinstall scripts
RUN npm ci --ignore-scripts --no-audit --no-fund

# Copy the rest of the repo
COPY . .

# Ensure CI-like behavior for retries, screenshots, videos per playwright.config.ts
ENV CI=1

# Default command (override with `docker run ... <cmd>` or in compose)
CMD ["npm", "test"]
