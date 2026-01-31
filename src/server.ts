import { app } from "./app";
import { prisma } from "./lib/prisma";

const PORT = Number(process.env.PORT) || 3004;
const HOST = '0.0.0.0'; // Bind to all interfaces for network access

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
    
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`Local access: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// For Vercel: export the app as default
export default app;

// For local development: start the server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  start();
}