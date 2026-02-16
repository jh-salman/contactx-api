import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";

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
    // if (card.userId === userId) throw new Error("You cannot save your own card");

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

    return { alreadySaved: false, contact };
};

// Create contact without cardId (manual / paper card / etc.)
const createContact = async (
    userId: string,
    data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        company?: string;
        jobTitle?: string;
        note?: string;
        whereMet?: string;
        profile_img?: string;
        latitude?: number | null;
        longitude?: number | null;
        city?: string | null;
        country?: string | null;
    }
) => {
    if (!userId) throw new Error("Unauthorized");

    const hasName = !!(data.firstName?.trim() || data.lastName?.trim());
    if (!hasName) throw new Error("First name or last name is required");

    let normalizedEmail = "";
    if (data.email !== undefined && data.email?.trim()) {
        try {
            normalizedEmail = normalizeEmail(data.email);
        } catch (error: any) {
            if (!data.phone?.trim()) throw error;
            normalizedEmail = "";
        }
    }
    const hasIdentifier = !!(data.phone?.trim() || normalizedEmail);
    if (!hasIdentifier) throw new Error("Phone or email is required");

    const noteText = data.whereMet?.trim()
        ? (data.note?.trim() ? `Met at: ${data.whereMet.trim()}\n\n${data.note.trim()}` : `Met at: ${data.whereMet.trim()}`)
        : (data.note?.trim() ?? "");

    const contact = await prisma.contact.create({
        data: {
            userId,
            cardId: null,
            firstName: data.firstName?.trim() ?? "",
            lastName: data.lastName?.trim() ?? "",
            phone: data.phone?.trim() ?? "",
            email: normalizedEmail,
            company: data.company?.trim() ?? "",
            jobTitle: data.jobTitle?.trim() ?? "",
            note: noteText,
            profile_img: data.profile_img ?? "",
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            city: data.city ?? null,
            country: data.country ?? null,
        },
    });

    return contact;
};

// Get all contacts
export const getAllContacts = async (userId: string) => {
    if (!userId) throw new Error("userId is required");

    try {
        const contacts = await prisma.contact.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return contacts || [];
    } catch (error: any) {
        // Handle database errors gracefully (table/column doesn't exist, etc.)
        logger.warn('Error fetching contacts, returning empty array', error);
        return [];
    }
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
        tags?: string[];
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

    // Handle tags - array of strings
    if (data.tags !== undefined) {
        if (!Array.isArray(data.tags) || !data.tags.every((t) => typeof t === 'string')) {
            throw new Error("tags must be an array of strings");
        }
        updateData.tags = data.tags;
    }

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

// Visitor shares their card with owner (scanned person) - auto-saves contact on owner's account
const shareVisitorContact = async (
    visitorId: string,
    ownerCardId: string,
    visitorCardId: string,
    scanLocation?: {
        latitude?: number;
        longitude?: number;
        city?: string;
        country?: string;
    }
) => {
    if (!visitorId) throw new Error("Unauthorized");
    if (!ownerCardId) throw new Error("Owner card ID is required");
    if (!visitorCardId) throw new Error("Visitor card ID is required");

    const ownerCard = await prisma.card.findUnique({
        where: { id: ownerCardId },
        select: { id: true, userId: true },
    });
    if (!ownerCard) throw new Error("Scanned card not found");

    const visitorCard = await prisma.card.findUnique({
        where: { id: visitorCardId },
        include: { personalInfo: true },
    });
    if (!visitorCard) throw new Error("Your card not found");
    if (visitorCard.userId !== visitorId) throw new Error("You can only share your own cards");

    const ownerId = ownerCard.userId;
    // if (ownerId === visitorId) throw new Error("You cannot share with yourself");

    const lat = scanLocation?.latitude ?? null;
    const lon = scanLocation?.longitude ?? null;
    const city = scanLocation?.city ?? "";
    const country = scanLocation?.country ?? "";

    const pi = visitorCard.personalInfo;
    const contactData = {
        firstName: pi?.firstName ?? "",
        lastName: pi?.lastName ?? "",
        phone: pi?.phoneNumber ?? "",
        email: pi?.email ?? "",
        company: pi?.company ?? "",
        jobTitle: pi?.jobTitle ?? "",
        logo: visitorCard.logo ?? "",
        profile_img: pi?.profile_img ?? visitorCard.profile ?? "",
        latitude: lat,
        longitude: lon,
        city,
        country,
    };

    const existingShare = await prisma.visitorContactShare.findFirst({
        where: {
            ownerCardId,
            visitorCardId,
            status: "approved",
        },
    });
    if (existingShare) {
        // Ensure contact exists on owner's account (may be missing if creation failed previously)
        const existingContact = await prisma.contact.findFirst({
            where: { userId: ownerId, cardId: visitorCardId },
        });
        if (!existingContact) {
            await prisma.contact.create({
                data: {
                    userId: ownerId,
                    cardId: visitorCardId,
                    ...contactData,
                },
            });
        }
        return { alreadySaved: true, share: existingShare };
    }

    const share = await prisma.visitorContactShare.create({
        data: {
            ownerCardId,
            visitorCardId,
            ownerId,
            visitorId,
            status: "approved",
            latitude: lat,
            longitude: lon,
            city,
            country,
        },
    });

    const existingContact = await prisma.contact.findFirst({
        where: { userId: ownerId, cardId: visitorCardId },
    });
    if (!existingContact) {
        await prisma.contact.create({
            data: {
                userId: ownerId,
                cardId: visitorCardId,
                ...contactData,
            },
        });
    } else {
        await prisma.contact.update({
            where: { id: existingContact.id },
            data: contactData,
        });
    }

    return { alreadySaved: false, share };
};

export const contactServices = {
    saveContact,
    createContact,
    getAllContacts,
    updateContact,
    deleteContact,
    shareVisitorContact,
};