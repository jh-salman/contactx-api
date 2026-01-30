import { prisma } from "../../lib/prisma";

// Helper function to validate and normalize email
const normalizeEmail = (email: string | undefined): string => {
    if (!email) return "";

    // Trim whitespace
    const trimmed = email.trim();

    // If empty after trimming, return empty string
    if (!trimmed) return "";

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email format
    if (!emailRegex.test(trimmed)) {
        throw new Error("Invalid email format");
    }

    // Convert to lowercase for consistency
    return trimmed.toLowerCase();
};

const saveContact = async (
    userId: string,
    cardId: string,
    data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        company?: string;
        jobTitle?: string;
        logo?: string;
        note?: string;
        profile_img?: string;
        latitude?: number;
        longitude?: number;
        city?: string;
        country?: string;
    }
) => {
    if (!userId) throw new Error("Unauthorized");
    if (!cardId) throw new Error("cardId is required");

    const card = await prisma.card.findUnique({
        where: { id: cardId },
        select: { id: true, userId: true },
    });
    if (!card) throw new Error("Card not found");
    
    // ✅ Visitor can save Owner's contact - no permission check needed
    // Just prevent saving own card
    if (card.userId === userId) throw new Error("You cannot save your own card");

    // 4️⃣ Normalize and validate email if provided
    // Only validate email format if phone is not provided (email becomes required)
    let normalizedEmail = "";
    if (data.email !== undefined) {
        try {
            normalizedEmail = normalizeEmail(data.email);
        } catch (error: any) {
            // If phone is provided, allow invalid email (just use empty string)
            // If phone is not provided, email validation error will be thrown
            if (!data.phone) {
                throw error; // Re-throw if email is required
            }
            // Otherwise, just use empty string (phone is provided, so email is optional)
            normalizedEmail = "";
        }
    }

    // 5️⃣ Minimum identifier check (after normalization)
    if (!data.phone && !normalizedEmail) throw new Error("Phone or email is required to save contact");

    // 6️⃣ Duplicate check (per user) - use normalized email
    const existing = await prisma.contact.findFirst({
        where: {
            userId,
            cardId,
            OR: [
                data.phone ? { phone: data.phone } : undefined,
                normalizedEmail ? { email: normalizedEmail } : undefined,
            ].filter(Boolean) as any[],
        },
    });
    if (existing) return { alreadySaved: true, contact: existing };

    // 7️⃣ Create contact
    const contact = await prisma.contact.create({
        data: {
            userId, // Visitor's user ID
            cardId, // Owner's card ID
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            phone: data.phone ?? "",
            email: normalizedEmail,
            company: data.company ?? "",
            jobTitle: data.jobTitle ?? "",
            logo: data.logo ?? "",
            note: data.note ?? "",
            profile_img: data.profile_img ?? "",
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            city: data.city ?? "",
            country: data.country ?? "",
        },
    });

    // 8️⃣ Create reverse permission request if flag is set
    // This allows owner to save customer's contact (if customer approves)
    if ((data as any).requestReversePermission && (data as any).customerCardId) {
        try {
            const customerCardId = (data as any).customerCardId;
            // Get owner's name for message
            const ownerPersonalInfo = await prisma.personalInfo.findUnique({
                where: { cardId },
            });
            const ownerName = ownerPersonalInfo
                ? `${ownerPersonalInfo.firstName || ''} ${ownerPersonalInfo.lastName || ''}`.trim() || 'Someone'
                : 'Someone';

            // Create reverse request (don't throw error if it fails - just log it)
            await createReverseContactRequest(
                cardId, // owner's card ID
                customerCardId, // customer's card ID
                `${ownerName} wants to save your contact info`
            );
            console.log('✅ Reverse permission request created automatically');
        } catch (error: any) {
            // Don't fail the contact save if reverse request fails
            console.error('⚠️ Failed to create reverse permission request:', error.message);
        }
    }

    return { alreadySaved: false, contact };
};

// Get all contacts
export const getAllContacts = async (userId: string) => {
    if (!userId) throw new Error("userId is required");

    const contacts = await prisma.contact.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });

    return contacts || [];
};

// Update contact
export const updateContact = async (
    contactId: string,
    userId: string,
    data: Partial<{
        firstName: string;
        lastName: string;
        phone: string;
        email?: string;
        company?: string;
        jobTitle?: string;
        logo?: string;
        note?: string;
        profile_img?: string;
        latitude?: number;
        longitude?: number;
        city?: string;
        country?: string;
    }>
) => {
    const existing = await prisma.contact.findFirst({
        where: { id: contactId, userId },
    });

    if (!existing) throw new Error("Contact not found or unauthorized");

    if (!data || Object.keys(data).length === 0) return existing;

    // Prepare update data - only include fields that are provided
    const updateData: any = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) {
        // Normalize and validate email before updating
        // Allow empty string to clear email, but validate format if provided
        try {
            updateData.email = normalizeEmail(data.email);
        } catch (error: any) {
            // If it's an empty string or undefined, allow it (to clear email)
            if (!data.email || data.email.trim() === "") {
                updateData.email = "";
            } else {
                // Invalid format - throw error
                throw error;
            }
        }
    }
    if (data.company !== undefined) updateData.company = data.company;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.profile_img !== undefined) updateData.profile_img = data.profile_img;

    // Handle location fields - allow null values
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.country !== undefined) updateData.country = data.country;

    return prisma.contact.update({
        where: { id: contactId },
        data: updateData,
    });
};

// Delete contact
export const deleteContact = async (contactId: string, userId: string) => {
    if (!contactId) throw new Error("contactId is required");
    if (!userId) throw new Error("Unauthorized");

    const contact = await prisma.contact.findFirst({
        where: { id: contactId, userId },
        select: { id: true },
    });

    if (!contact) {
        return {
            success: false,
            message: "Contact already deleted or not found",
        };
    }

    await prisma.contact.delete({ where: { id: contactId } });

    return {
        success: true,
        message: "Contact deleted successfully",
    };
};

// Permission Request Services (Flow 2)
const requestContactPermission = async (
    requesterId: string,
    cardId: string,
    message?: string
) => {
    if (!requesterId) throw new Error("Unauthorized");
    if (!cardId) throw new Error("cardId is required");

    // Check if contactRequest model is available in Prisma client
    if (!prisma.contactRequest) {
        throw new Error("ContactRequest model not found. Please run 'npx prisma generate' to regenerate Prisma client.");
    }

    // 1️⃣ Check card exists
    const card = await prisma.card.findUnique({
        where: { id: cardId },
        select: {
            id: true,
            userId: true,
            personalInfo: true,
        },
    });
    if (!card) throw new Error("Card not found");

    // 2️⃣ Prevent self-request
    if (card.userId === requesterId) {
        throw new Error("You cannot request your own card");
    }

    // 3️⃣ Check if already requested
    const existingRequest = await prisma.contactRequest.findFirst({
        where: {
            requesterId,
            cardId,
            status: "pending",
        },
    });

    if (existingRequest) {
        throw new Error("Request already sent and pending");
    }

    // 4️⃣ Check if already approved and contact exists
    const approvedRequest = await prisma.contactRequest.findFirst({
        where: {
            requesterId,
            cardId,
            status: "approved",
        },
    });

    if (approvedRequest) {
        // Check if contact already exists
        const existingContact = await prisma.contact.findFirst({
            where: {
                userId: requesterId,
                cardId,
            },
        });

        if (existingContact) {
            throw new Error("Contact already saved");
        }
    }

    // 5️⃣ Create permission request
    const request = await prisma.contactRequest.create({
        data: {
            requesterId,
            cardId,
            cardOwnerId: card.userId,
            message: message || null,
            status: "pending",
        },
        include: {
            requester: {
                select: { id: true, name: true, email: true, image: true },
            },
            card: {
                include: {
                    personalInfo: true,
                },
            },
        },
    });

    return request;
};

const getReceivedRequests = async (userId: string) => {
    if (!userId) throw new Error("userId is required");

    // Check if contactRequest model is available in Prisma client
    if (!prisma.contactRequest) {
        throw new Error("ContactRequest model not found. Please run 'npx prisma generate' to regenerate Prisma client.");
    }

    const requests = await prisma.contactRequest.findMany({
        where: {
            cardOwnerId: userId,
            status: "pending",
        },
        include: {
            requester: {
                select: { id: true, name: true, email: true, image: true },
            },
            card: {
                include: {
                    personalInfo: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return requests || [];
};

const getSentRequests = async (userId: string) => {
    if (!userId) throw new Error("userId is required");

    // Check if contactRequest model is available in Prisma client
    if (!prisma.contactRequest) {
        throw new Error("ContactRequest model not found. Please run 'npx prisma generate' to regenerate Prisma client.");
    }

    const requests = await prisma.contactRequest.findMany({
        where: {
            requesterId: userId,
        },
        include: {
            card: {
                include: {
                    personalInfo: true,
                },
            },
            cardOwner: {
                select: { id: true, name: true, email: true, image: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return requests || [];
};

const approveRequest = async (requestId: string, cardOwnerId: string) => {
    if (!requestId) throw new Error("requestId is required");
    if (!cardOwnerId) throw new Error("Unauthorized");

    // Check if contactRequest model is available in Prisma client
    if (!prisma.contactRequest) {
        throw new Error("ContactRequest model not found. Please run 'npx prisma generate' to regenerate Prisma client.");
    }

    // 1️⃣ Find request
    const request = await prisma.contactRequest.findUnique({
        where: { id: requestId },
        include: {
            card: {
                include: {
                    personalInfo: true,
                },
            },
        },
    });

    if (!request) throw new Error("Request not found");

    // 2️⃣ Check ownership
    if (request.cardOwnerId !== cardOwnerId) {
        throw new Error("Unauthorized - not your request");
    }

    // 3️⃣ Check status
    if (request.status !== "pending") {
        throw new Error(`Request already ${request.status}`);
    }

    // 4️⃣ Update request status
    await prisma.contactRequest.update({
        where: { id: requestId },
        data: { status: "approved" },
    });

    // 5️⃣ Create contact for requester (Owner's list)
    const personalInfo = request.card.personalInfo;
    if (!personalInfo) {
        throw new Error("Card personal info not found");
    }

    // Check if contact already exists
    const existingContact = await prisma.contact.findFirst({
        where: {
            userId: request.requesterId,
            cardId: request.cardId,
        },
    });

    if (existingContact) {
        return { contact: existingContact, alreadyExists: true };
    }

    // 6️⃣ Get scan location from customer's contact (where they saved owner's card)
    // Find customer's contact where they saved the owner's card
    // This contact will have the scan location from when customer scanned owner's QR code
    let scanLocation: {
        latitude: number | null;
        longitude: number | null;
        city: string;
        country: string;
    } = {
        latitude: null,
        longitude: null,
        city: "",
        country: "",
    };

    try {
        // Find all cards owned by the requester (owner)
        const ownerCards = await prisma.card.findMany({
            where: { userId: request.requesterId },
            select: { id: true },
        });

        // Find customer's contact where they saved owner's card
        // This contact will have the scan location
        if (ownerCards.length > 0) {
            const ownerCardIds = ownerCards.map(card => card.id);
            const customerContact = await prisma.contact.findFirst({
                where: {
                    userId: request.cardOwnerId, // Customer's userId
                    cardId: { in: ownerCardIds }, // Owner's card ID
                },
                orderBy: { createdAt: "desc" }, // Get the most recent one
            });

            if (customerContact) {
                // Use the same location from customer's contact
                scanLocation = {
                    latitude: customerContact.latitude,
                    longitude: customerContact.longitude,
                    city: customerContact.city || "",
                    country: customerContact.country || "",
                };
                console.log('📍 Using scan location from customer contact:', scanLocation);
            }
        }
    } catch (error: any) {
        console.error('⚠️ Could not get scan location from customer contact:', error.message);
        // Continue without location - will use fallback or null
    }

    // Create contact
    // Normalize email if provided, handle errors gracefully
    let normalizedEmail = "";
    if (personalInfo.email) {
        try {
            normalizedEmail = normalizeEmail(personalInfo.email);
        } catch (error) {
            // If email is invalid, just use empty string (phone might be available)
            normalizedEmail = "";
        }
    }

    const contact = await prisma.contact.create({
        data: {
            userId: request.requesterId, // Owner's ID (who requested)
            cardId: request.cardId, // Customer's card
            firstName: personalInfo.firstName || "",
            lastName: personalInfo.lastName || "",
            phone: personalInfo.phoneNumber || "",
            email: normalizedEmail,
            company: personalInfo.company || "",
            jobTitle: personalInfo.jobTitle || "",
            logo: request.card.logo || "",
            profile_img: request.card.profile || "",
            // Use the same scan location from customer's contact
            latitude: scanLocation.latitude,
            longitude: scanLocation.longitude,
            city: scanLocation.city,
            country: scanLocation.country,
        },
    });

    return { contact, alreadyExists: false };
};

const rejectRequest = async (requestId: string, cardOwnerId: string) => {
    if (!requestId) throw new Error("requestId is required");
    if (!cardOwnerId) throw new Error("Unauthorized");

    // Check if contactRequest model is available in Prisma client
    if (!prisma.contactRequest) {
        throw new Error("ContactRequest model not found. Please run 'npx prisma generate' to regenerate Prisma client.");
    }

    // 1️⃣ Find request
    const request = await prisma.contactRequest.findUnique({
        where: { id: requestId },
    });

    if (!request) throw new Error("Request not found");

    // 2️⃣ Check ownership
    if (request.cardOwnerId !== cardOwnerId) {
        throw new Error("Unauthorized - not your request");
    }

    // 3️⃣ Check status
    if (request.status !== "pending") {
        throw new Error(`Request already ${request.status}`);
    }

    // 4️⃣ Update request status
    const updated = await prisma.contactRequest.update({
        where: { id: requestId },
        data: { status: "rejected" },
    });

    return updated;
};

// Create reverse permission request: When customer saves owner's contact,
// automatically create a request from owner to customer
const createReverseContactRequest = async (
    ownerCardId: string,
    customerCardId: string,
    message?: string
) => {
    if (!ownerCardId) throw new Error("Owner card ID is required");
    if (!customerCardId) throw new Error("Customer card ID is required");

    // Check if contactRequest model is available in Prisma client
    if (!prisma.contactRequest) {
        throw new Error("ContactRequest model not found. Please run 'npx prisma generate' to regenerate Prisma client.");
    }

    // 1️⃣ Get owner's card to find owner's userId
    const ownerCard = await prisma.card.findUnique({
        where: { id: ownerCardId },
        include: { personalInfo: true },
    });
    if (!ownerCard) throw new Error("Owner card not found");

    // 2️⃣ Get customer's card to find customer's userId
    const customerCard = await prisma.card.findUnique({
        where: { id: customerCardId },
        select: { id: true, userId: true },
    });
    if (!customerCard) throw new Error("Customer card not found");

    // 3️⃣ Prevent self-request
    if (ownerCard.userId === customerCard.userId) {
        throw new Error("Cannot create reverse request for same user");
    }

    // 4️⃣ Check if already requested
    const existingRequest = await prisma.contactRequest.findFirst({
        where: {
            requesterId: ownerCard.userId, // Owner requesting
            cardId: customerCardId, // Customer's card
            status: "pending",
        },
    });

    if (existingRequest) {
        // Request already exists, return it
        return existingRequest;
    }

    // 5️⃣ Get owner's name for message
    const ownerName = ownerCard.personalInfo
        ? `${ownerCard.personalInfo.firstName || ''} ${ownerCard.personalInfo.lastName || ''}`.trim() || 'Someone'
        : 'Someone';

    // 6️⃣ Create reverse permission request
    // FROM owner TO customer
    const request = await prisma.contactRequest.create({
        data: {
            requesterId: ownerCard.userId, // Owner's userId
            cardId: customerCardId, // Customer's card ID
            cardOwnerId: customerCard.userId, // Customer's userId
            message: message || `${ownerName} wants to save your contact info`,
            status: "pending",
        },
        include: {
            requester: {
                select: { id: true, name: true, email: true, image: true },
            },
            card: {
                include: {
                    personalInfo: true,
                },
            },
        },
    });

    return request;
};

export const contactServices = {
    saveContact,
    getAllContacts,
    updateContact,
    deleteContact,
    requestContactPermission,
    getReceivedRequests,
    getSentRequests,
    approveRequest,
    rejectRequest,
    createReverseContactRequest,
};