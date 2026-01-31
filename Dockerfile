# Use Node.js 22.12.0 (LTS) - Required for Prisma 7.2.0
FROM node:22.12.0-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy TypeScript config
COPY tsconfig.json ./

# Copy source code
COPY src ./src/

# Build TypeScript (this creates dist/ folder)
RUN npm run build

# Verify build output exists
RUN ls -la dist/ || (echo "Build failed - dist folder not found" && exit 1)
RUN ls -la dist/src/ || (echo "dist/src folder not found" && exit 1)
RUN test -f dist/src/server.js || (echo "dist/src/server.js not found" && exit 1)

# Expose port
EXPOSE 3004

# Start server (update path to match actual build output)
CMD ["node", "dist/src/server.js"]

