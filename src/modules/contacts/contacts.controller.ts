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

// Permission Request Controllers (Flow 2)
const requestContactPermissionController = async (req: Request, res: Response, next: any) => {
    try {
        const requesterId = req.user?.id as string | undefined;
        const { cardId } = req.params as { cardId?: string };
        const { message } = req.body as { message?: string };

        if (!requesterId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!cardId) {
            return res.status(400).json({ success: false, message: "Card ID is required" });
        }

        const request = await contactServices.requestContactPermission(requesterId, cardId, message);

        res.status(201).json({
            success: true,
            message: "Contact request sent successfully",
            data: request,
        });
    } catch (error: any) {
        logger.error('Request contact permission error', error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong",
            });
        }
        next(error);
    }
};

const getReceivedRequestsController = async (req: Request, res: Response, next: any) => {
    try {
        const userId = req.user?.id as string;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const requests = await contactServices.getReceivedRequests(userId);

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error: any) {
        // Services already return empty arrays, but handle any unexpected errors
        logger.warn('Error in getReceivedRequestsController', error);
        if (!res.headersSent) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }
    }
};

const getSentRequestsController = async (req: Request, res: Response, next: any) => {
    try {
        const userId = req.user?.id as string;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const requests = await contactServices.getSentRequests(userId);

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error: any) {
        // Services already return empty arrays, but handle any unexpected errors
        logger.warn('Error in getSentRequestsController', error);
        if (!res.headersSent) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }
    }
};

const approveRequestController = async (req: Request, res: Response, next: any) => {
    try {
        const cardOwnerId = req.user?.id as string | undefined;
        const { requestId } = req.params as { requestId?: string };

        if (!cardOwnerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!requestId) {
            return res.status(400).json({ success: false, message: "Request ID is required" });
        }

        const result = await contactServices.approveRequest(requestId, cardOwnerId);

        res.status(200).json({
            success: true,
            message: result.alreadyExists 
                ? "Contact already exists" 
                : "Request approved and contact saved",
            data: result.contact,
        });
    } catch (error: any) {
        logger.error('Approve request error', error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong",
            });
        }
        next(error);
    }
};

const rejectRequestController = async (req: Request, res: Response, next: any) => {
    try {
        const cardOwnerId = req.user?.id as string | undefined;
        const { requestId } = req.params as { requestId?: string };

        if (!cardOwnerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!requestId) {
            return res.status(400).json({ success: false, message: "Request ID is required" });
        }

        const request = await contactServices.rejectRequest(requestId, cardOwnerId);

        res.status(200).json({
            success: true,
            message: "Request rejected",
            data: request,
        });
    } catch (error: any) {
        logger.error('Reject request error', error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong",
            });
        }
        next(error);
    }
};

// Create reverse permission request controller
const createReversePermissionRequestController = async (req: Request, res: Response, next: any) => {
    try {
        const { ownerCardId, customerCardId, message } = req.body as {
            ownerCardId?: string;
            customerCardId?: string;
            message?: string;
        };

        if (!ownerCardId) {
            return res.status(400).json({ success: false, message: "Owner card ID is required" });
        }

        if (!customerCardId) {
            return res.status(400).json({ success: false, message: "Customer card ID is required" });
        }

        const request = await contactServices.createReverseContactRequest(
            ownerCardId,
            customerCardId,
            message
        );

        res.status(201).json({
            success: true,
            message: "Reverse permission request created successfully",
            data: request,
        });
    } catch (error: any) {
        logger.error('Create reverse permission request error', error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong",
            });
        }
        next(error);
    }
};

export const contactController = { 
    saveContactController, 
    getAllContactsController, 
    updateContactController, 
    deleteContactController,
    requestContactPermissionController,
    getReceivedRequestsController,
    getSentRequestsController,
    approveRequestController,
    rejectRequestController,
    createReversePermissionRequestController,
};