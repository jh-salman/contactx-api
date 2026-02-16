import { Request, Response, NextFunction } from "express";
import { contactServices } from "./contacts.services";
import { getLocationFromIP, getFallbackLocation } from "../../lib/ipGeolocation";
import { getClientIP } from "../../lib/getClientIP";
import { logger } from "../../lib/logger";


const saveContactController = async (req: Request, res: Response, next: any) => {
    try {
        const userId = req.user?.id as string | undefined;
        const { cardId } = req.params as { cardId?: string };
        let contactData = req.body;

        // 1️⃣ Auth check
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // 2️⃣ CardId check
        if (!cardId) {
            return res.status(400).json({ success: false, message: "Card ID is required" });
        }

        // 3️⃣ Empty body allowed
        if (!contactData || Object.keys(contactData).length === 0) {
            return res.status(200).json({
                success: true,
                message: "No data provided, nothing to save",
                data: null,
            });
        }

        // 4️⃣ Smart IP detection - works in dev and production
        const ip = getClientIP(req);
        logger.debug('Client IP for contact save', { ip });

        // 5️⃣ Get location from IP if not provided
        // Priority: Scan location (provided) > IP location > Fallback
        if (ip && (!contactData.latitude || !contactData.city)) {
            logger.debug('Fetching location from IP for contact', { ip });
            // Pass req object for header detection
            const ipLocation = await getLocationFromIP(ip, req);
            
            if (ipLocation) {
                logger.debug('Location fetched for contact', { ipLocation });
                // Only use IP location if scan location not already provided
                contactData = {
                    ...contactData,
                    latitude: contactData.latitude ?? ipLocation.latitude ?? 0,
                    longitude: contactData.longitude ?? ipLocation.longitude ?? 0,
                    city: contactData.city ?? ipLocation.city ?? '',
                    country: contactData.country ?? ipLocation.country ?? '',
                };
            }
        } else if (contactData.latitude || contactData.city) {
            logger.debug('Using provided scan location for contact', {
                latitude: contactData.latitude,
                longitude: contactData.longitude,
                city: contactData.city,
                country: contactData.country,
            });
        }
        
        // Ensure at least city and country are set (even if coordinates are 0)
        if (!contactData.city && !contactData.country) {
            logger.warn('No location data for contact, using fallback');
            const fallback = getFallbackLocation();
            contactData.city = contactData.city || fallback.city;
            contactData.country = contactData.country || fallback.country;
        }

        // 6️⃣ Save contact
        const result = await contactServices.saveContact(userId, cardId, contactData);

        if (result.alreadySaved) {
            return res.status(200).json({
                success: true,
                message: "Contact already saved",
                data: result.contact,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Contact saved successfully",
            data: result.contact,
        });
    } catch (error: any) {
        logger.error('Save contact controller error', error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong",
            });
        }
        logger.error("Unhandled error after response", error);
    }
};

// Get all contacts
const getAllContactsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const contacts = await contactServices.getAllContacts(userId);

    res.status(200).json({ success: true, data: contacts });
  } catch (error: any) {
    // Services already return empty arrays, but handle any unexpected errors
    logger.warn('Error in getAllContactsController', error);
    res.status(200).json({ success: true, data: [] });
  }
};

// Update contact
const updateContactController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;
    let updateData = req.body;

        // Optional: Get location from IP if updating location fields
        const ip = getClientIP(req);
        logger.debug('Client IP for contact update', { ip });

        // If updating location and IP available, add location from IP
        if (ip && (!updateData.latitude || !updateData.city)) {
            logger.debug('Fetching location from IP for contact update', { ip });
            // Pass req object for header detection
            const ipLocation = await getLocationFromIP(ip, req);
            
            if (ipLocation) {
                logger.debug('Location fetched for contact update', { ipLocation });
                updateData = {
                    ...updateData,
                    latitude: updateData.latitude ?? ipLocation.latitude ?? 0,
                    longitude: updateData.longitude ?? ipLocation.longitude ?? 0,
                    city: updateData.city ?? ipLocation.city ?? '',
                    country: updateData.country ?? ipLocation.country ?? '',
                };
            }
        }
        
        // Ensure at least city and country are set (even if coordinates are 0)
        if (!updateData.city && !updateData.country) {
            logger.warn('No location data for contact update, using fallback');
            const fallback = getFallbackLocation();
            updateData.city = updateData.city || fallback.city;
            updateData.country = updateData.country || fallback.country;
        }

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!contactId) {
            return res.status(400).json({ success: false, message: "Contact ID is required" });
        }

        const updated = await contactServices.updateContact(contactId as string, userId as string, updateData);

        res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            data: updated,
        });
    } catch (error: any) {
        if (!res.headersSent) {
            res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// Delete contact
const deleteContactController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await contactServices.deleteContact(contactId!, userId);

    res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Create contact without cardId (manual / paper card / etc.)
const createContactController = async (req: Request, res: Response, next: any) => {
    try {
        const userId = req.user?.id as string | undefined;
        let contactData = req.body as {
            firstName?: string;
            lastName?: string;
            phone?: string;
            email?: string;
            company?: string;
            jobTitle?: string;
            note?: string;
            whereMet?: string;
            profile_img?: string;
            city?: string | null;
            country?: string | null;
            latitude?: number | null;
            longitude?: number | null;
        };

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!contactData || typeof contactData !== "object") {
            return res.status(400).json({ success: false, message: "Invalid request body" });
        }

        const ip = getClientIP(req);
        const hasLocation = !!(contactData.city || contactData.country || contactData.latitude != null || contactData.longitude != null);

        if (!hasLocation && ip) {
            const ipLocation = await getLocationFromIP(ip, req);
            if (ipLocation) {
                contactData = {
                    ...contactData,
                    latitude: contactData.latitude ?? ipLocation.latitude ?? null,
                    longitude: contactData.longitude ?? ipLocation.longitude ?? null,
                    city: contactData.city ?? ipLocation.city ?? null,
                    country: contactData.country ?? ipLocation.country ?? null,
                };
            }
        }
        if (!contactData.city && !contactData.country && (contactData.latitude == null || contactData.longitude == null)) {
            const fallback = getFallbackLocation();
            contactData.city = contactData.city ?? fallback.city ?? null;
            contactData.country = contactData.country ?? fallback.country ?? null;
        }

        const contact = await contactServices.createContact(userId, contactData);

        return res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: contact,
        });
    } catch (error: any) {
        logger.error("Create contact error", error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to create contact",
            });
        }
        next(error);
    }
};

// Visitor shares their card with owner (scanned person) - auto-saves on owner's account
const shareVisitorContactController = async (req: Request, res: Response, next: any) => {
    try {
        const visitorId = req.user?.id as string | undefined;
        const { ownerCardId, visitorCardId, scanLocation } = req.body as {
            ownerCardId?: string;
            visitorCardId?: string;
            scanLocation?: { latitude?: number; longitude?: number; city?: string; country?: string };
        };

        if (!visitorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!ownerCardId) {
            return res.status(400).json({ success: false, message: "Owner card ID is required" });
        }
        if (!visitorCardId) {
            return res.status(400).json({ success: false, message: "Visitor card ID is required" });
        }

        const result = await contactServices.shareVisitorContact(
            visitorId,
            ownerCardId,
            visitorCardId,
            scanLocation
        );

        return res.status(201).json({
            success: true,
            message: result.alreadySaved ? "Already shared" : "Contact shared successfully",
            data: result.share,
            alreadySaved: result.alreadySaved,
        });
    } catch (error: any) {
        logger.error("Share visitor contact error", error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to share contact",
            });
        }
        next(error);
    }
};

export const contactController = { 
    saveContactController, 
    createContactController,
    getAllContactsController, 
    updateContactController, 
    deleteContactController,
    shareVisitorContactController,
};