import { app } from "./app";
import { prisma } from "./lib/prisma";
import { logger } from "./lib/logger";

const PORT = Number(process.env.PORT) || 3004;
const HOST = '0.0.0.0'; // Bind to all interfaces for network access

async function start() {
  try {
    await prisma.$connect();
    logger.info("Connected to database");
    
    app.listen(PORT, HOST, () => {
      logger.info(`Server running on http://${HOST}:${PORT}`, {
        localAccess: `http://localhost:${PORT}`
      });
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

// For Vercel: export the app as default
export default app;

// For local development: start the server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  start();
}