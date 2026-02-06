import dotenv from "dotenv";
import path from "path";

// Determine environment
const env = process.env.NODE_ENV || 'development';

// Load appropriate .env file
if (env !== 'production') {
  dotenv.config({
    path: path.join(process.cwd(), `.env.${env}`)
  });
}

export const config = {
    env,
    port: process.env.PORT || "3004",
    authOrigin: process.env.AUTH_TRUSTED_ORIGINS || "",
    databaseUrl: process.env.DATABASE_URL || "",
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
    betterAuthUrl: process.env.BETTER_AUTH_URL || "",
    cloudinaryCloudName: process.env.CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUD_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUD_API_SECRET || ""
}