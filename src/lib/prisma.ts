import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  const error = new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please ensure DATABASE_URL is configured in your Vercel environment variables.'
  );
  console.error('❌ Prisma initialization error:', error.message);
  throw error;
}

let adapter: PrismaPg;
let prisma: PrismaClient;

try {
  adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
  
  // Handle Prisma connection cleanup for serverless environments
  // In serverless environments, connections are reused across invocations
  // No need to disconnect on each request - Vercel handles connection pooling
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error);
  throw new Error(
    `Prisma client initialization failed: ${error instanceof Error ? error.message : String(error)}`
  );
}

export { prisma };