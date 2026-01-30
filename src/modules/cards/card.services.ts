import { Card } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { generateQRCode } from "../../lib/qr";
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
<<<<<<< HEAD
    personalInfo?: { firstName: string; lastName: string; jobTitle: string, phoneNumber:string } ,
=======
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
    },
>>>>>>> features/scan-contact
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

    const cards = await prisma.card.findMany({
        where: { userId },
        include: {
            personalInfo: true,
            socialLinks: true,
            contacts:true
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // optional: return empty array instead of throwing
    if (!cards || cards.length === 0) {
        return []; // safer for frontend
    }

    return cards;
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
    deleteCard
}