import { Request, Response, NextFunction } from "express";
import { scanServices } from "./scan.services";
import { getClientIP } from "../../lib/getClientIP";


const trackScanController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    if (!cardId) return res.status(400).json({ success: false, message: "Card ID is required" });

    // Smart IP detection - works in dev and production
    const ip = getClientIP(req);
    console.log('🌐 Client IP detected:', ip);

    // Request meta info
    const meta = {
      ip: ip ?? undefined,
      userAgent: req.headers["user-agent"]?.toString(),
      source: req.query.source === "link" ? "link" : "qr",
      latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
      longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
      city: req.query.city as string | undefined,
      country: req.query.country as string | undefined,
    } as {
      ip?: string;
      userAgent?: string; 
      source?: "qr" | "link";
      latitude?: number;
      longitude?: number;
      city?: string;
      country?: string;
    }

    // Scan track + card fetch (location will be auto-detected from IP)
    const card = await scanServices.trackScanAndFetchCard(cardId, meta);

    res.status(200).json({
      success: true,
      message: "Scan tracked successfully",
      data: card,
    });
  } catch (error: any) {
    console.error('❌ Scan controller error:', error);
    next(error);
  }
};

export const scanController = { trackScanController };
