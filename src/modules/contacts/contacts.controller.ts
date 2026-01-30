import { Request, Response, NextFunction } from "express";
import { contactServices } from "./contacts.services";
<<<<<<< HEAD

// ✅ Step 2: Visitor saves Owner's contact (NO permission needed)
const saveContactController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // Visitor's user ID
    const { cardId } = req.params as { cardId: string }; // Owner's card ID
    const data = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
=======
import { getLocationFromIP, getFallbackLocation } from "../../lib/ipGeolocation";
import { getClientIP } from "../../lib/getClientIP";


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
        console.log('🌐 Client IP for contact save:', ip);

        // 5️⃣ Get location from IP if not provided
        // Priority: Scan location (provided) > IP location > Fallback
        if (ip && (!contactData.latitude || !contactData.city)) {
            console.log('🔍 Fetching location from IP for contact:', ip);
            // Pass req object for header detection
            const ipLocation = await getLocationFromIP(ip, req);
            
            if (ipLocation) {
                console.log('✅ Location fetched for contact:', ipLocation);
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
            console.log('📍 Using provided scan location for contact:', {
                latitude: contactData.latitude,
                longitude: contactData.longitude,
                city: contactData.city,
                country: contactData.country,
            });
        }
        
        // Ensure at least city and country are set (even if coordinates are 0)
        if (!contactData.city && !contactData.country) {
            console.log('⚠️ No location data for contact, using fallback');
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
        console.error('❌ Save contact controller error:', error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong",
            });
        }
        console.error("Unhandled error after response:", error);
>>>>>>> features/scan-contact
    }

    const result = await contactServices.saveContact(userId, cardId, data);

    res.status(200).json({
      success: true,
      message: result.alreadySaved ? "Contact already saved" : "Contact saved successfully",
      data: result.contact,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
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
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update contact
const updateContactController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;
    const data = req.body;

<<<<<<< HEAD
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
=======
        // Optional: Get location from IP if updating location fields
        const ip = getClientIP(req);
        console.log('🌐 Client IP for contact update:', ip);

        // If updating location and IP available, add location from IP
        if (ip && (!updateData.latitude || !updateData.city)) {
            console.log('🔍 Fetching location from IP for contact update:', ip);
            // Pass req object for header detection
            const ipLocation = await getLocationFromIP(ip, req);
            
            if (ipLocation) {
                console.log('✅ Location fetched for contact update:', ipLocation);
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
            console.log('⚠️ No location data for contact update, using fallback');
            const fallback = getFallbackLocation();
            updateData.city = updateData.city || fallback.city;
            updateData.country = updateData.country || fallback.country;
        }

        const updated = await contactServices.updateContact(contactId, userId, updateData);

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
>>>>>>> features/scan-contact
    }

    const updated = await contactServices.updateContact(contactId!, userId, data);

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
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

<<<<<<< HEAD
// ✅ Step 4: Visitor shares their contact with Owner
const shareVisitorContactController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // Visitor's user ID
    const { ownerCardId, visitorCardId, scanLocation } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!ownerCardId || !visitorCardId) {
      return res.status(400).json({ 
        success: false, 
        message: "ownerCardId and visitorCardId are required" 
      });
    }

    const result = await contactServices.shareVisitorContact(
      userId,
      ownerCardId,
      visitorCardId,
      scanLocation
    );

    res.status(200).json({
      success: true,
      message: "Contact share request sent to owner",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Step 5: Owner gets pending visitor shares
const getPendingVisitorSharesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // Owner's user ID

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const shares = await contactServices.getPendingVisitorShares(userId);

    res.status(200).json({
      success: true,
      data: shares,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Step 6: Owner approves visitor share
const approveVisitorShareController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // Owner's user ID
    const { shareId } = req.params as { shareId: string };

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await contactServices.approveVisitorShare(shareId, userId);

    res.status(200).json({
      success: true,
      message: "Visitor contact saved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Step 6: Owner rejects visitor share
const rejectVisitorShareController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // Owner's user ID
    const { shareId } = req.params as { shareId: string };

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await contactServices.rejectVisitorShare(shareId, userId);

    res.status(200).json({
      success: true,
      message: "Visitor share rejected",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Optional: Owner requests Customer's contact permission
const requestContactPermissionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { cardId } = req.params as { cardId: string };
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await contactServices.requestContactPermission(userId, cardId, message);

    res.status(200).json({
      success: true,
      message: "Contact request sent successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get received requests (Customer sees Owner's requests)
const getReceivedRequestsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const requests = await contactServices.getReceivedRequests(userId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get sent requests (Owner sees their requests)
const getSentRequestsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const requests = await contactServices.getSentRequests(userId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Approve request (Customer approves)
const approveRequestController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { requestId } = req.params as { requestId: string };

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await contactServices.approveRequest(requestId, userId);

    res.status(200).json({
      success: true,
      message: "Request approved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Reject request (Customer rejects)
const rejectRequestController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { requestId } = req.params as { requestId: string };

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await contactServices.rejectRequest(requestId, userId);

    res.status(200).json({
      success: true,
      message: "Request rejected",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const contactController = {
  saveContactController,
  getAllContactsController,
  updateContactController,
  deleteContactController,
  shareVisitorContactController,
  getPendingVisitorSharesController,
  approveVisitorShareController,
  rejectVisitorShareController,
  requestContactPermissionController,
  getReceivedRequestsController,
  getSentRequestsController,
  approveRequestController,
  rejectRequestController,
=======
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
        console.error('❌ Request contact permission error:', error);
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
        console.error('❌ Get received requests error:', error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong",
            });
        }
        next(error);
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
        console.error('❌ Get sent requests error:', error);
        if (!res.headersSent) {
            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong",
            });
        }
        next(error);
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
        console.error('❌ Approve request error:', error);
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
        console.error('❌ Reject request error:', error);
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

        const request = await contactServices.createReversePermissionRequest(
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
        console.error('❌ Create reverse permission request error:', error);
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
>>>>>>> features/scan-contact
};