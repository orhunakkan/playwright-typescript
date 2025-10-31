# Official Playwright image matching project version
FROM mcr.microsoft.com/playwright:v1.56.1-jammy

# Avoid interactive prompts in CI/containers
ENV CI=1

# Create working directory
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./

# Use npm ci if lockfile exists, otherwise fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the project
COPY . .

# Default command: run tests
CMD ["npx", "playwright", "test"]
