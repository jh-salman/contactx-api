import { logger } from './logger';

interface RateLimitEntry {
  count: number;
  resetAt: number;
  firstAttempt: number;
}

// In-memory store (production-এ Redis ব্যবহার করুন)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const checkOTPRateLimit = (
  phoneNumber: string,
  options: {
    maxAttempts: number;
    windowMs: number; // Time window in milliseconds
  }
): { allowed: boolean; retryAfter?: number; remainingAttempts?: number } => {
  const key = `otp:${phoneNumber}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // No entry or expired, create new
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
      firstAttempt: now,
    });
    return { 
      allowed: true, 
      remainingAttempts: options.maxAttempts - 1 
    };
  }

  if (entry.count >= options.maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    logger.warn('OTP rate limit exceeded (application level)', {
      phoneNumber,
      count: entry.count,
      maxAttempts: options.maxAttempts,
      retryAfter,
      windowMs: options.windowMs,
    });
    return { 
      allowed: false, 
      retryAfter,
      remainingAttempts: 0 
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return { 
    allowed: true, 
    remainingAttempts: options.maxAttempts - entry.count 
  };
};

// Get rate limit config from environment or use defaults
export const getOTPRateLimitConfig = () => {
  return {
    maxAttempts: parseInt(process.env.OTP_RATE_LIMIT_MAX_ATTEMPTS || '3', 10),
    windowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW_SECONDS || '60', 10) * 1000,
  };
};
