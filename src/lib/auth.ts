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
            "https://contact-x-api.vercel.app", // Production Vercel URL - mobile apps use this as origin
            "https://hwy-editorial-updates-talked.trycloudflare.com", // Cloudflare tunnel
            process.env.BETTER_AUTH_URL,
            process.env.FRONTEND_URL,
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
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
    // Vercel URL (Vercel automatically provides VERCEL_URL)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // Production fallback - use Vercel URL if in production
    if (process.env.NODE_ENV === 'production') {
        return 'https://contact-x-api.vercel.app';
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
