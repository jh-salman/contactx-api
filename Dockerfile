# Use Node.js 22.12.0 (LTS) - Required for Prisma 7.2.0
FROM node:22.12.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3004

# Start server
CMD ["npm", "start"]

