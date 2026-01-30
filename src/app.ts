import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { requireAuth } from "./middlewere/requireAuth";
import { cardRoutes } from "./modules/cards/card.routes";
import { publicCardRoutes } from "./modules/publicCard/publicCard.routes";
import { scanRoutes } from "./modules/analytics/scan.routes";
import { contactRoutes } from "./modules/contacts/contacts.routes";
import { notFoundRoute } from "./middlewere/notFoundRoute";
import { globalErrorHandler } from "./middlewere/globalErrorHandler";
import morgan from "morgan";

export const app = express();

// Increase JSON payload limit for Vercel
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Only use morgan in development (not in production/Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan("dev"));
}

// CORS Configuration - supports both development and production
const allowedOrigins = [
  "http://localhost:3004",
  "http://localhost:3000",
  "http://localhost:8081",
  // Vercel production URL (will be set via env)
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
  process.env.FRONTEND_URL,
  process.env.EXPO_APP_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (_, res) => {
  res.send("Hello World");
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

app.use(notFoundRoute);
app.use(globalErrorHandler);

// 🔑 THIS IS IMPORTANT
export default app;
