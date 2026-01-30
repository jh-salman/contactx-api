import { prisma } from "../../lib/prisma";
<<<<<<< HEAD
import { getLocationFromIP } from "../../lib/ipGeolocation";
// import { contactServices } from "../contact/contact.services";
=======
import { getLocationFromIP, getFallbackLocation } from "../../lib/ipGeolocation";
>>>>>>> features/scan-contact

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
  if (!card) throw new Error("Card not found");

<<<<<<< HEAD
  // Resolve location if missing
  const finalMeta = { ...meta };
  if (!meta.latitude || !meta.longitude || !meta.city) {
    if (meta.ip) {
      const ipLocation = await getLocationFromIP(meta.ip);
      if (ipLocation) {
        finalMeta.latitude = finalMeta.latitude ?? ipLocation.latitude;
        finalMeta.longitude = finalMeta.longitude ?? ipLocation.longitude;
        finalMeta.city = finalMeta.city ?? ipLocation.city;
        finalMeta.country = finalMeta.country ?? ipLocation.country;
      }
=======
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
>>>>>>> features/scan-contact
    }
  }
  
  // Ensure at least city and country are set (even if coordinates are 0)
  if (!finalMeta.city && !finalMeta.country) {
    console.log('⚠️ No location data, using fallback');
    const fallback = getFallbackLocation();
    finalMeta.city = finalMeta.city || fallback.city;
    finalMeta.country = finalMeta.country || fallback.country;
  }

<<<<<<< HEAD
  // Validate coordinates
  if (finalMeta.latitude && (finalMeta.latitude < -90 || finalMeta.latitude > 90))
    throw new Error("Invalid latitude");
  if (finalMeta.longitude && (finalMeta.longitude < -180 || finalMeta.longitude > 180))
    throw new Error("Invalid longitude");

  // Create scan
  const scan = await prisma.cardScan.create({
=======
  // 4️⃣ Track scan
  const scanRecord = await prisma.cardScan.create({
>>>>>>> features/scan-contact
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

<<<<<<< HEAD
  return {
    card,
    cardScan: {
      id: scan.id,
      scannedAt: scan.createdAt,
      ip: scan.ip,
      userAgent: scan.userAgent,
      source: scan.source,
      latitude: scan.latitude,
      longitude: scan.longitude,
      city: scan.city,
      country: scan.country,
    },
    message: "Scan tracked successfully",
=======
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
>>>>>>> features/scan-contact
  };
};

export const scanServices = { trackScanAndFetchCard };
