// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { phoneNumber } from "better-auth/plugins";



<<<<<<< HEAD
// // Parse trusted origins from environment variable or use defaults
// // Can be comma-separated string or array
// const getTrustedOrigins = (): string[] => {
//     const envOrigins = process.env.AUTH_TRUSTED_ORIGINS;
//     let origins: string[] = [];
=======
// Parse trusted origins from environment variable or use defaults
// Can be comma-separated string or array
const getTrustedOrigins = (): string[] => {
    const envOrigins = process.env.AUTH_TRUSTED_ORIGINS;
    let origins: string[] = [];
    
    if (envOrigins) {
        // Support both comma-separated string and array format
        origins = envOrigins.includes(',') 
            ? envOrigins.split(',').map(origin => origin.trim())
            : [envOrigins.trim()];
    } else {
        // Default origins for development - include all possible variations
        origins = [
            "http://localhost:3000",
            "http://localhost:3004",
            "http://127.0.0.1:3004",
            "http://10.26.38.18:3004", // Mobile app origin (update IP if it changes)
            // Add Vercel URL if available
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
            process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
            process.env.BETTER_AUTH_URL,
            process.env.FRONTEND_URL,
        ].filter(Boolean) as string[];
    }
    
    // Log trusted origins for debugging
    console.log('🔐 Better Auth Trusted Origins:', origins);
    
    return origins;
};
>>>>>>> features/scan-contact

//     if (envOrigins) {
//         // Support both comma-separated string and array format
//         origins = envOrigins.includes(',') 
//             ? envOrigins.split(',').map(origin => origin.trim())
//             : [envOrigins.trim()];
//     } else {
//         // Default origins for development - include all possible variations
//         // If AUTH_TRUSTED_ORIGINS is not set in .env, use these defaults
//         origins = [
//             "http://localhost:3000",
//             "http://localhost:3004",
//             "http://127.0.0.1:3004",
//             "http://10.26.38.18:3004", // Mobile app origin (update IP if it changes)
//         ];
//     }

//     // Log trusted origins for debugging
//     console.log('🔐 Better Auth Trusted Origins:', origins);

//     return origins;
// };

// const trustedOriginsList = getTrustedOrigins();

// Get base URL for Better Auth
const getBaseURL = (): string => {
    if (process.env.BETTER_AUTH_URL) {
        return process.env.BETTER_AUTH_URL;
    }
    // Vercel URL (with https:// prefix)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    return 'http://localhost:3004';
};

export const auth = betterAuth({
<<<<<<< HEAD
    trustedOrigins: [
        'http://localhost:3004',
        'http://10.23.61.18:3004',  // ✅ New IP
    ],
=======
    trustedOrigins: trustedOriginsList,
    baseURL: getBaseURL(),
>>>>>>> features/scan-contact
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        phoneNumber({
            sendOTP: ({ phoneNumber, code }, ctx) => {
                console.log("otp ", code)
            },
            signUpOnVerification: {
                getTempEmail: (phone) => `${phone}@temp.yoursite.com`,
                getTempName: (phone) => `User_${phone}`
            }
        })
    ]
});
