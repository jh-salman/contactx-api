<<<<<<< HEAD
import { app } from './app';

const PORT = Number(process.env.PORT) || 3004; // ✅ Convert to number
const HOST = '0.0.0.0'; // ✅ Bind to all interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://10.102.144.18:${PORT}`);
});
=======
import { app } from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3004;

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

start();
>>>>>>> features/scan-contact
