import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { logger } from './logger';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  const error = new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please ensure DATABASE_URL is configured in your environment variables.'
  );
  logger.error('Prisma initialization error', error);
  throw error;
}

let adapter: PrismaPg;
let prisma: PrismaClient;

try {
  adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });

// Handle Prisma connection cleanup
  // Connections are reused across invocations in production environments
} catch (error) {
  logger.error('Failed to initialize Prisma client', error);
  throw new Error(
    `Prisma client initialization failed: ${error instanceof Error ? error.message : String(error)}`
  );
}

export { prisma };