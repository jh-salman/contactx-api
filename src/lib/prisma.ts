import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Handle Prisma connection cleanup for serverless environments
if (process.env.NODE_ENV === 'production') {
  // In serverless environments, connections are reused
  // No need to disconnect on each request
}

export { prisma };