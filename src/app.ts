import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { requireAuth } from "./middleware/requireAuth";
import { cardRoutes } from "./modules/cards/card.routes";
import { publicCardRoutes } from "./modules/publicCard/publicCard.routes";
import { scanRoutes } from "./modules/analytics/scan.routes";
import { contactRoutes } from "./modules/contacts/contacts.routes";
import { uploadRoutes } from "./modules/upload/upload.routes";
import { notFoundRoute } from "./middleware/notFoundRoute";
import { logger } from "./lib/logger";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import morgan from "morgan";

export const app = express();

// Increase JSON payload limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Only use morgan in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan("dev"));
}

// CORS Configuration - supports both development and production
const allowedOrigins = [
  'http://localhost:3004',
  'http://127.0.0.1:3004',
  'http://10.153.79.18:3004',  // ← নতুন Mac IP
  'exp://10.153.79.18:8081',   // ← Expo dev server
  'http://10.153.79.18:8081',  // ← Alternative Expo URL

  'https://contactx.xsalonx.com/api', // ← Production Vercel URL
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://10.108.105.18:3004',
  'http://10.102.144.18:3004',
  process.env.FRONTEND_URL,
  process.env.EXPO_APP_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // console.log এর পরিবর্তে logger ব্যবহার করুন
      logger.warn('CORS blocked origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Origin', 'X-Requested-Origin', 'X-Forwarded-Origin', 'Referer', 'X-Timezone'],
}));

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (_, res) => {
  res.send("Hello World");
});

// Health check endpoint
app.get("/api/health", (_, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Root API endpoint with server information
app.get("/api", (_, res) => {
  res.json({
    name: "ContactX API Server",
    version: process.env.npm_package_version || "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      auth: "/api/auth",
      cards: "/api/card",
      publicCard: "/api/public-card",
      contacts: "/api/contacts",
      scan: "/api/scan",
      upload: "/api/upload",
      health: "/api/health",
    },
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      },
    },
  });
});

app.get("/api/protected", requireAuth, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
    session: req.session,
  });
});

app.use("/api/card", requireAuth, cardRoutes);
app.use("/api/public-card", publicCardRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/contacts", requireAuth, contactRoutes);
app.use("/api/upload", requireAuth, uploadRoutes);

app.use(notFoundRoute);
app.use(globalErrorHandler);

// 🔑 THIS IS IMPORTANT
export default app;