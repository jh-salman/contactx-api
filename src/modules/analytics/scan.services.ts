import { prisma } from "../../lib/prisma";
import { getLocationFromIP, getFallbackLocation } from "../../lib/ipGeolocation";

export const trackScanAndFetchCard = async (
  cardId: string,
  meta: {
    ip?: string;
    userAgent?: string;
    source?: "qr" | "link";
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  }
) => {
  if (!cardId) throw new Error("cardId is required");

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { personalInfo: true, socialLinks: true },
  });
  if (!card) {
    throw new Error("Card not found");
  }

  // 3️⃣ Get location from IP if not provided
  let finalMeta = { ...meta };
  
  // Only fetch from IP if location not already provided
  if (meta.ip && (!meta.latitude || !meta.city)) {
    console.log('🔍 Fetching location from IP:', meta.ip);
    // Note: We don't pass req here, but you can modify to pass it if needed
    const ipLocation = await getLocationFromIP(meta.ip);
    
    if (ipLocation) {
      console.log('✅ Location fetched:', ipLocation);
      // Use IP location if available, but prefer provided location
      // At minimum, ensure city and country are set
      finalMeta = {
        ...meta,
        latitude: meta.latitude ?? ipLocation.latitude ?? 0,
        longitude: meta.longitude ?? ipLocation.longitude ?? 0,
        city: meta.city ?? ipLocation.city ?? '',
        country: meta.country ?? ipLocation.country ?? '',
      };
    }
  }
  
  // Ensure at least city and country are set (even if coordinates are 0)
  if (!finalMeta.city && !finalMeta.country) {
    console.log('⚠️ No location data, using fallback');
    const fallback = getFallbackLocation();
    finalMeta.city = finalMeta.city || fallback.city;
    finalMeta.country = finalMeta.country || fallback.country;
  }

  // 4️⃣ Track scan
  const scanRecord = await prisma.cardScan.create({
    data: {
      cardId: card.id,
      ip: finalMeta.ip ?? null,
      userAgent: finalMeta.userAgent ?? null,
      source: finalMeta.source ?? "qr",
      latitude: finalMeta.latitude ?? null,
      longitude: finalMeta.longitude ?? null,
      city: finalMeta.city ?? null,
      country: finalMeta.country ?? null,
    },
  });

  console.log('📊 Scan tracked:', {
    ip: finalMeta.ip,
    city: finalMeta.city,
    country: finalMeta.country,
  });

  // 5️⃣ Return card with scan location
  return {
    ...card,
    scanLocation: {
      latitude: scanRecord.latitude,
      longitude: scanRecord.longitude,
      city: scanRecord.city,
      country: scanRecord.country,
    }
  };
};

export const scanServices = { trackScanAndFetchCard };
