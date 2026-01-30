// Vercel serverless function entry point
// This file is the entry point for Vercel serverless functions
// All module-level initialization happens when this file is imported

import express from 'express';

// Try to import the app - if initialization fails, we'll catch it
let app: express.Application;
let initError: Error | null = null;

try {
  // This import triggers:
  // 1. src/app.ts imports
  // 2. src/lib/auth.ts initialization (which imports prisma)
  // 3. src/lib/prisma.ts initialization (creates Prisma client)
  // If any of these fail, the error will be caught below
  const appModule = require('../src/app');
  app = appModule.app || appModule.default;
  
  if (!app) {
    throw new Error('Failed to load Express app from src/app.ts');
  }
} catch (error) {
  // Capture the initialization error
  initError = error instanceof Error ? error : new Error(String(error));
  
  console.error('❌ CRITICAL: Failed to initialize application');
  console.error('Error:', initError.message);
  console.error('Stack:', initError.stack);
  console.error('Environment check:', {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
  });
  
  // Create a minimal error-handling app
  app = express();
  app.use(express.json());
  
  // All routes return initialization error
  app.use((req, res) => {
    res.status(500).json({
      error: 'FUNCTION_INVOCATION_FAILED',
      message: 'Server initialization failed',
      details: process.env.NODE_ENV === 'development' 
        ? initError?.message 
        : 'Application failed to initialize. Check Vercel logs for details.',
      // Include debugging info in development/preview
      ...(process.env.NODE_ENV !== 'production' && {
        stack: initError?.stack,
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
          nodeEnv: process.env.NODE_ENV,
        }
      })
    });
  });
}

// Export the Express app as default handler for Vercel
// Vercel expects a default export that is an Express app or request handler
export default app;

// Also export as named export for compatibility
export { app };

