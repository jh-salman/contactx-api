// Vercel serverless function entry point
import { app } from '../src/app';

// Export the Express app as default handler for Vercel
export default app;

// Also export as named export for compatibility
export { app };

