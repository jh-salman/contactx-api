// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { phoneNumber } from "better-auth/plugins";
import { getTwilioStatus, sendOTPViaWhatsApp } from "./twilio";
import { logger } from "./logger";

// Web origins that must always be allowed (Expo web dev + EAS web deploy)
const ESSENTIAL_WEB_ORIGINS = [
    "http://localhost:8081", // Expo dev server (web)
    "https://salonx--wtbnn1wdao.expo.app", // EAS web deploy
];

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
            "http://localhost:8081", // Expo dev server (web)
            "http://127.0.0.1:3004",
            "http://10.26.38.18:3004", // Mobile app origin (update IP if it changes)
            "https://contactx.xsalonx.com", // Production domain - mobile apps use this as origin
            "https://salonx--wtbnn1wdao.expo.app", // EAS web deploy
            process.env.BETTER_AUTH_URL,
            process.env.FRONTEND_URL,
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        ].filter(Boolean) as string[];
    }
    
    // Always include essential web origins so production accepts localhost + EAS web
    for (const origin of ESSENTIAL_WEB_ORIGINS) {
        if (origin && !origins.includes(origin)) {
            origins.push(origin);
        }
    }
    
    // Log trusted origins for debugging
    logger.info('Better Auth Trusted Origins', { origins });
    
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
    // Production fallback - use production domain if in production
    if (process.env.NODE_ENV === 'production') {
        return 'https://contactx.xsalonx.com';
    }
    // Development fallback - use tunnel URL
    return 'https://hwy-editorial-updates-talked.trycloudflare.com';
};

// Initialize Better Auth with error handling
let auth: ReturnType<typeof betterAuth>;

try {
    const baseURL = getBaseURL();
    logger.info('Better Auth Base URL', { baseURL });
    
    // Log Twilio configuration status
    const twilioStatus = getTwilioStatus();
    if (twilioStatus.configured) {
        logger.info('Twilio is configured and ready', { 
            note: 'Better Auth generates OTP → WhatsApp only. Verification by Better Auth only.'
        });
    } else {
        logger.warn('Twilio is not fully configured', {
            hasAccountSid: twilioStatus.hasAccountSid,
            hasAuthToken: twilioStatus.hasAuthToken,
            hasPhoneNumber: twilioStatus.hasPhoneNumber,
            note: 'OTP codes will be logged to console instead of sent via WhatsApp'
        });
    }
    
    auth = betterAuth({
    trustedOrigins: trustedOriginsList,
    baseURL: baseURL,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        phoneNumber({
            sendOTP: async ({ phoneNumber, code }, ctx) => {
                const bypassCode = process.env.OTP_BYPASS_CODE;
                if (bypassCode) {
                    logger.info("OTP bypass mode - skip Twilio. Use code for testing", {
                        phoneNumber,
                        bypassCode,
                        note: "Set OTP_BYPASS_CODE in env for testing without Twilio"
                    });
                    return; // No SMS/WhatsApp sent - verification will accept bypass code
                }

                logger.info("Sending OTP (Better Auth generated) via WhatsApp only", { phoneNumber });
                logger.debug("Better Auth OTP code", { codeLength: code?.length });
                
                const whatsappResult = await sendOTPViaWhatsApp(phoneNumber, code);
                
                if (whatsappResult.success) {
                    logger.info("OTP sent successfully via WhatsApp (Better Auth code)", {
                        phoneNumber,
                        messageSid: whatsappResult.messageSid,
                        note: "Better Auth generated code sent via WhatsApp"
                    });
                } else {
                    logger.error("Failed to send OTP via WhatsApp", {
                        phoneNumber,
                        whatsappError: whatsappResult.errorMessage,
                        code
                    });
                    throw new Error(whatsappResult.errorMessage || "Failed to send OTP via WhatsApp");
                }
            },
            // Only override verifyOTP when OTP_BYPASS_CODE is set - otherwise Better Auth uses default
            ...(process.env.OTP_BYPASS_CODE && {
                verifyOTP: async ({ phoneNumber, code }) => {
                    if (code?.trim() === process.env.OTP_BYPASS_CODE) {
                        logger.info("OTP bypass accepted", { phoneNumber });
                        return true;
                    }
                    return false;
                },
            }),
            signUpOnVerification: {
                getTempEmail: (phone) => `${phone}@temp.yoursite.com`,
                getTempName: (phone) => `User_${phone}`
            }
        })
    ]
});
} catch (error) {
    logger.error('Failed to initialize Better Auth', error);
    throw new Error(
        `Better Auth initialization failed: ${error instanceof Error ? error.message : String(error)}. ` +
        'Please check your DATABASE_URL and BETTER_AUTH_SECRET environment variables.'
    );
}

export { auth };