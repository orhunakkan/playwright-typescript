FROM mcr.microsoft.com/playwright:v1.58.1-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Run tests
CMD ["npx", "playwright", "test"]
