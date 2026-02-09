// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { phoneNumber } from "better-auth/plugins";
import { sendOTPCodeViaVerify, verifyOTPCodeViaVerify, getTwilioStatus } from "./twilio";
import { logger } from "./logger";

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
            "https://contactx.xsalonx.com", // Production domain - mobile apps use this as origin
            process.env.BETTER_AUTH_URL,
            process.env.FRONTEND_URL,
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        ].filter(Boolean) as string[];
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
            note: 'Using Twilio Verify API - Twilio generates the code' 
        });
    } else {
        logger.warn('Twilio is not fully configured', {
            hasAccountSid: twilioStatus.hasAccountSid,
            hasAuthToken: twilioStatus.hasAuthToken,
            hasPhoneNumber: twilioStatus.hasPhoneNumber,
            note: 'OTP codes will be logged to console instead of sent via SMS'
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
                logger.info("Sending OTP", { phoneNumber });
                logger.debug("OTP Code (Better Auth generated - fallback)", { code });
                
                // Use Twilio Verify API (works with Bangladesh numbers, avoids Error 21612)
                // Optional: Use custom template from environment variable
                const templateSid = process.env.TWILIO_VERIFY_TEMPLATE_SID;
                const result = await sendOTPCodeViaVerify(phoneNumber, templateSid);
                
                if (result.success) {
                    logger.info("OTP sent successfully via Twilio Verify API", { 
                        phoneNumber,
                        sid: result.sid 
                    });
                } else {
                    logger.warn("Failed to send OTP via Twilio Verify API", { 
                        phoneNumber,
                        error: result.error,
                        code // Fallback: Better Auth generated code logged to console
                    });
                }
            },
            verifyOTP: async ({ phoneNumber, code }, ctx) => {
                // Custom verification using Twilio Verify API
                logger.info("Verifying OTP via Twilio Verify API", { phoneNumber });
                
                const result = await verifyOTPCodeViaVerify(phoneNumber, code);
                
                if (result.valid) {
                    logger.info("OTP verified successfully via Twilio Verify API", { phoneNumber });
                    return { success: true };
                } else {
                    logger.warn("OTP verification failed", { phoneNumber, error: result.error });
                    return { success: false, error: result.error || "Invalid code" };
                }
            },
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
