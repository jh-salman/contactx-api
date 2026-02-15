import { Card } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { generateQRCode } from "../../lib/qr";
import { logger } from "../../lib/logger";
// import { Card } from "@prisma/client";

const createCard = async (
    userId: string,
    cardTitle?: string,
    cardColor?: string,
    logo?: string,
    profile?: string,
    cover?: string,
    imagesAndLayouts?: any,
    isFavorite?: boolean,
    personalInfo?: {
        firstName?: string;
        lastName?: string;
        jobTitle?: string;
        phoneNumber: string; // Required
        email?: string;
        company?: string;
        image?: string;
        logo?: string;
        note?: string;
        banner?: string;
        profile_img?: string;
        middleName?: string;
        prefix?: string;
        suffix?: string;
        pronoun?: string;
        preferred?: string;
        maidenName?: string;
    },
    socialLinks?: any[]
) => {
    if (!userId) throw new Error("userId is required");

    // Validate phoneNumber is provided if personalInfo exists
    if (personalInfo && !personalInfo.phoneNumber) {
        throw new Error("phoneNumber is required in personalInfo");
    }

    // 1️⃣ Create the card first
    const card = await prisma.card.create({
        data: {
            userId,
            cardTitle: cardTitle ?? "ConactX",
            cardColor: cardColor ?? "black",
            logo: logo ?? null,
            profile: profile ?? null,
            cover: cover ?? null,
            qrCode: null,
            qrImage: null,
            imagesAndLayouts,
            isFavorite: isFavorite ?? false,
            ...(personalInfo && {
                personalInfo: {
                    create: {
                        firstName: personalInfo.firstName ?? null,
                        lastName: personalInfo.lastName ?? null,
                        jobTitle: personalInfo.jobTitle ?? null,
                        phoneNumber: personalInfo.phoneNumber,
                        email: personalInfo.email ?? null,
                        company: personalInfo.company ?? null,
                        image: personalInfo.image ?? null,
                        logo: personalInfo.logo ?? null,
                        note: personalInfo.note ?? null,
                        banner: personalInfo.banner ?? null,
                        profile_img: personalInfo.profile_img ?? null,
                        middleName: personalInfo.middleName ?? null,
                        prefix: personalInfo.prefix ?? null,
                        suffix: personalInfo.suffix ?? null,
                        pronoun: personalInfo.pronoun ?? null,
                        preferred: personalInfo.preferred ?? null,
                        maidenName: personalInfo.maidenName ?? null,
                    },
                },
            }),
            ...(socialLinks && socialLinks.length > 0
                ? { socialLinks: { create: { links: socialLinks.slice(0, 5) } } }
                : {}),
        },
    });

    // 2️⃣ Generate QR code pointing to the public card URL
    const { qrCode, qrImage } = await generateQRCode(card.id);

    // 3️⃣ Update card with QR info
    const updatedCard = await prisma.card.update({
        where: { id: card.id },
        data: { qrCode, qrImage },
        include: {
            personalInfo: true,
            socialLinks: true,
        },
    });

    return updatedCard;
};






// Get all card 

const getAllCard = async (userId: string): Promise<Card[]> => {
    if (!userId) {
        throw new Error("userId is required");
    }

    try {
        logger.debug('Fetching cards for userId', { userId });
        
        // Fetch cards WITHOUT includes to avoid column errors
    const cards = await prisma.card.findMany({
        where: { userId },
        orderBy: {
            createdAt: "desc",
        },
    });

        logger.debug('Found cards (basic)', { count: cards.length });
        
    if (!cards || cards.length === 0) {
            logger.debug('No cards found for userId', { userId });
            return [];
        }

        // Manually fetch relations separately to avoid Prisma schema errors
        const cardsWithRelations = await Promise.all(
            cards.map(async (card) => {
                const result: any = { ...card };
                
                // Try to fetch personalInfo manually
                try {
                    const personalInfo = await prisma.personalInfo.findUnique({
                        where: { cardId: card.id },
                    });
                    result.personalInfo = personalInfo;
                } catch (e: any) {
                    logger.warn(`personalInfo fetch failed for card`, e, { cardId: card.id });
                    result.personalInfo = null;
                }
                
                // Try to fetch socialLinks manually
                try {
                    const socialLinks = await prisma.socialLinks.findUnique({
                        where: { cardId: card.id },
                    });
                    result.socialLinks = socialLinks;
                } catch (e: any) {
                    logger.warn(`socialLinks fetch failed for card`, e, { cardId: card.id });
                    result.socialLinks = null;
                }
                
                return result;
            })
        );

        logger.debug('Cards with relations', { count: cardsWithRelations.length });
        if (cardsWithRelations.length > 0) {
            logger.debug('Card IDs', { cardIds: cardsWithRelations.map(c => c.id) });
        }
        
        return cardsWithRelations as Card[];
        
    } catch (error: any) {
        // Handle database errors gracefully
        logger.error('Error fetching cards', error, {
            userId
        });
        
        // Return empty array for schema errors
        if (error.message?.includes('column') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('(not available)') ||
            error.code === 'P2001') {
            return [];
        }
        
        throw error;
    }
};


/// update signle card
const updateCard = async (
    cardId: string,
    userId: string,
    payload: {
        cardTitle?: string;
        cardColor?: string;
        logo?: string | null;
        profile?: string | null;
        cover?: string | null;
        imagesAndLayouts?: any;
        isFavorite?: boolean;
        qrCode?: string | null;
        personalInfo?: {
            firstName?: string;
            lastName?: string;
            jobTitle?: string;
            phoneNumber?: string;
            email?: string;
            company?: string;
            image?: string;
            logo?: string;
            note?: string;
            banner?: string;
            profile_img?: string;
            middleName?: string;
            prefix?: string;
            suffix?: string;
            pronoun?: string;
            preferred?: string;
            maidenName?: string;
        };
        socialLinks?: any[];
    }
) => {
    if (!cardId || !userId) {
        throw new Error("cardId and userId are required");
    }

    // ownership check
    const existing = await prisma.card.findFirst({
        where: { id: cardId, userId },
    });

    if (!existing) {
        throw new Error("Card not found or unauthorized");
    }

    // Check if personalInfo exists - if not, phoneNumber is required for create
    const existingPersonalInfo = await prisma.personalInfo.findUnique({
        where: { cardId },
    });

    if (payload.personalInfo && !existingPersonalInfo && !payload.personalInfo.phoneNumber) {
        throw new Error("phoneNumber is required when creating personalInfo");
    }

    const updated = await prisma.card.update({
        where: { id: cardId },
        data: {
            ...(payload.cardTitle && { cardTitle: payload.cardTitle }),
            ...(payload.cardColor && { cardColor: payload.cardColor }),

            ...(payload.logo !== undefined && { logo: payload.logo }),
            ...(payload.profile !== undefined && { profile: payload.profile }),
            ...(payload.cover !== undefined && { cover: payload.cover }),
           

            ...(payload.imagesAndLayouts !== undefined && {
                imagesAndLayouts: payload.imagesAndLayouts,
            }),

            ...(payload.isFavorite !== undefined && {
                isFavorite: payload.isFavorite,
            }),

            ...(payload.personalInfo && {
                personalInfo: {
                    upsert: {
                        create: {
                            firstName: payload.personalInfo.firstName ?? null,
                            lastName: payload.personalInfo.lastName ?? null,
                            jobTitle: payload.personalInfo.jobTitle ?? null,
                            phoneNumber: payload.personalInfo.phoneNumber!, // Already validated above
                            email: payload.personalInfo.email ?? null,
                            company: payload.personalInfo.company ?? null,
                            image: payload.personalInfo.image ?? null,
                            logo: payload.personalInfo.logo ?? null,
                            note: payload.personalInfo.note ?? null,
                            banner: payload.personalInfo.banner ?? null,
                            profile_img: payload.personalInfo.profile_img ?? null,
                            middleName: payload.personalInfo.middleName ?? null,
                            prefix: payload.personalInfo.prefix ?? null,
                            suffix: payload.personalInfo.suffix ?? null,
                            pronoun: payload.personalInfo.pronoun ?? null,
                            preferred: payload.personalInfo.preferred ?? null,
                            maidenName: payload.personalInfo.maidenName ?? null,
                        },
                        update: {
                            ...(payload.personalInfo.firstName !== undefined && { firstName: payload.personalInfo.firstName }),
                            ...(payload.personalInfo.lastName !== undefined && { lastName: payload.personalInfo.lastName }),
                            ...(payload.personalInfo.jobTitle !== undefined && { jobTitle: payload.personalInfo.jobTitle }),
                            ...(payload.personalInfo.phoneNumber !== undefined && { phoneNumber: payload.personalInfo.phoneNumber }),
                            ...(payload.personalInfo.email !== undefined && { email: payload.personalInfo.email }),
                            ...(payload.personalInfo.company !== undefined && { company: payload.personalInfo.company }),
                            ...(payload.personalInfo.image !== undefined && { image: payload.personalInfo.image }),
                            ...(payload.personalInfo.logo !== undefined && { logo: payload.personalInfo.logo }),
                            ...(payload.personalInfo.note !== undefined && { note: payload.personalInfo.note }),
                            ...(payload.personalInfo.banner !== undefined && { banner: payload.personalInfo.banner }),
                            ...(payload.personalInfo.profile_img !== undefined && { profile_img: payload.personalInfo.profile_img }),
                            ...(payload.personalInfo.middleName !== undefined && { middleName: payload.personalInfo.middleName }),
                            ...(payload.personalInfo.prefix !== undefined && { prefix: payload.personalInfo.prefix }),
                            ...(payload.personalInfo.suffix !== undefined && { suffix: payload.personalInfo.suffix }),
                            ...(payload.personalInfo.pronoun !== undefined && { pronoun: payload.personalInfo.pronoun }),
                            ...(payload.personalInfo.preferred !== undefined && { preferred: payload.personalInfo.preferred }),
                            ...(payload.personalInfo.maidenName !== undefined && { maidenName: payload.personalInfo.maidenName }),
                        },
                    },
                },
            }),

            ...(payload.socialLinks && {
                socialLinks: {
                    upsert: {
                        create: {
                            links: payload.socialLinks.slice(0, 5),
                        },
                        update: {
                            links: payload.socialLinks.slice(0, 5),
                        },
                    },
                },
            }),
        },
        include: {
            personalInfo: true,
            socialLinks: true,
        },
    });

    return updated;
};



// Get card by ID (helper for image deletion)
const getCardById = async (cardId: string, userId: string) => {
    const card = await prisma.card.findFirst({
        where: { id: cardId, userId },
        include: {
            personalInfo: true,
            socialLinks: true,
        },
    });
    
    if (!card) {
        throw new Error("Card not found or unauthorized");
    }
    
    return card;
};

// delete card 
const deleteCard = async (cardId: string, userId: string) => {
    if (!cardId || !userId) {
        throw new Error("cardId and userId are required");
    }

    const existing = await prisma.card.findFirst({
        where: { id: cardId, userId },
    });

    if (!existing) {
        throw new Error("Card not found or unauthorized");
    }

    await prisma.card.delete({
        where: { id: cardId },
    });

    return true;
};


export const cardServices = {
    createCard,
    getAllCard,
    updateCard,
    deleteCard,
    getCardById
}