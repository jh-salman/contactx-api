import dotenv from "dotenv";
import path from "path";

// Load environment variables
// In Vercel, environment variables are automatically available
// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.join(process.cwd(), ".env")
  });
}

export const config = {
    port: process.env.PORT || "3004",
    authOrigin: process.env.AUTH_TRUSTED_ORIGINS || "",
    databaseUrl: process.env.DATABASE_URL || "",
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
    betterAuthUrl: process.env.BETTER_AUTH_URL || "",
    cloudinaryCloudName: process.env.CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUD_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUD_API_SECRET || ""
}