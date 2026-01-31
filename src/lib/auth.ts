// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { phoneNumber } from "better-auth/plugins";

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
            "https://hwy-editorial-updates-talked.trycloudflare.com", // Cloudflare tunnel
            "https://seems-alive-launch-review.trycloudflare.com", // Expo tunnel
            process.env.BETTER_AUTH_URL,
            process.env.FRONTEND_URL,
        ].filter(Boolean) as string[];
    }
    
    // Log trusted origins for debugging
    console.log('🔐 Better Auth Trusted Origins:', origins);
    
    return origins;
};

const trustedOriginsList = getTrustedOrigins();

// Get base URL for Better Auth
const getBaseURL = (): string => {
    if (process.env.BETTER_AUTH_URL) {
        return process.env.BETTER_AUTH_URL;
    }
    // Use tunnel URL if available (for Cloudflare tunnel)
    if (process.env.CLOUDFLARE_TUNNEL_URL) {
        return process.env.CLOUDFLARE_TUNNEL_URL;
    }
    // Production fallback - throw error if no URL configured
    if (process.env.NODE_ENV === 'production') {
        throw new Error('BETTER_AUTH_URL must be set in production');
    }
    // Development fallback - use tunnel URL
    return 'https://hwy-editorial-updates-talked.trycloudflare.com';
};

// Initialize Better Auth with error handling
let auth: ReturnType<typeof betterAuth>;

try {
    const baseURL = getBaseURL();
    console.log('🔗 Better Auth Base URL:', baseURL);
    
    auth = betterAuth({
    trustedOrigins: trustedOriginsList,
    baseURL: baseURL,
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
} catch (error) {
    console.error('❌ Failed to initialize Better Auth:', error);
    throw new Error(
        `Better Auth initialization failed: ${error instanceof Error ? error.message : String(error)}. ` +
        'Please check your DATABASE_URL and BETTER_AUTH_SECRET environment variables.'
    );
}

export { auth };
