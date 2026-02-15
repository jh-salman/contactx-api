import twilio from 'twilio';
import { logger } from './logger';
import { checkOTPRateLimit, getOTPRateLimitConfig } from './otpRateLimiter';

// Check if Twilio is properly configured
export const isTwilioConfigured = (): boolean => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  return !!(accountSid && authToken && phoneNumber);
};

// Get Twilio configuration status
export const getTwilioStatus = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  
  return {
    configured: !!(accountSid && authToken && phoneNumber),
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasPhoneNumber: !!phoneNumber,
    hasVerifyServiceSid: !!verifyServiceSid,
    phoneNumber: phoneNumber || 'Not set',
    verifyServiceSid: verifyServiceSid || 'Not set'
  };
};

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    logger.warn('Twilio credentials not found. SMS will not be sent.', {
      missing: {
        accountSid: !accountSid ? 'TWILIO_ACCOUNT_SID' : null,
        authToken: !authToken ? 'TWILIO_AUTH_TOKEN' : null,
      }
    });
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// Format phone number for Bangladesh (+880)
const formatBangladeshPhoneNumber = (phone: string): string => {
  // Remove all spaces, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove leading 0 if present (local format: 01712345678)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If starts with 880 (country code without +)
  if (cleaned.startsWith('880')) {
    return '+' + cleaned;
  }
  // If starts with 1 and has 10 digits (local number: 1712345678)
  else if (cleaned.startsWith('1') && cleaned.length === 10) {
    return '+880' + cleaned;
  }
  // If already has +880
  else if (cleaned.startsWith('+880')) {
    return cleaned;
  }
  
  // Default: add +880 if it looks like a Bangladesh number
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    return '+880' + cleaned;
  }
  
  return cleaned;
};

// Format phone number for USA (+1)
const formatUSAPhoneNumber = (phone: string): string => {
  // Remove all spaces, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // If starts with 1 (country code without +)
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return '+' + cleaned;
  }
  // If it's a 10-digit number (local format)
  else if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return '+1' + cleaned;
  }
  // If already has +1
  else if (cleaned.startsWith('+1')) {
    return cleaned;
  }
  
  return cleaned;
};

// Format phone number (supports USA and Bangladesh)
export const formatPhoneNumber = (phone: string): string => {
  // Remove all spaces, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's already formatted with country code
  if (cleaned.startsWith('+880')) {
    return formatBangladeshPhoneNumber(cleaned);
  }
  if (cleaned.startsWith('+1')) {
    return formatUSAPhoneNumber(cleaned);
  }
  
  // Detect Bangladesh number patterns
  // Pattern 1: Starts with 0 (local format: 01712345678)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return formatBangladeshPhoneNumber(cleaned);
  }
  // Pattern 2: Starts with 880 (country code without +)
  if (cleaned.startsWith('880') && cleaned.length === 13) {
    return formatBangladeshPhoneNumber(cleaned);
  }
  // Pattern 3: Starts with 1 and has 10 digits (Bangladesh local: 1712345678)
  // Note: This is ambiguous - could be USA or BD. We'll check context.
  // BD mobile numbers are typically 11 digits with country code (880 + 1 + 9 digits)
  // So 10 digits starting with 1 is more likely USA
  
  // Detect USA number patterns
  // Pattern 1: 10 digits (local format: 2086269799)
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return formatUSAPhoneNumber(cleaned);
  }
  // Pattern 2: 11 digits starting with 1 (country code: 12086269799)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return formatUSAPhoneNumber(cleaned);
  }
  
  // If already has +, return as-is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Default: add + prefix
  return '+' + cleaned;
};

// Send SMS via Twilio
export const sendSMS = async (to: string, message: string): Promise<{ success: boolean; messageSid?: string; status?: string; errorCode?: number; errorMessage?: string }> => {
  // Use Messaging Service SID for international SMS (works with Bangladesh)
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER; // Fallback for US numbers only
  
  try {
    const client = getTwilioClient();
    if (!client) {
      logger.warn('Twilio client not initialized. SMS not sent.');
      return { success: false };
    }
    
    // Format phone number (supports USA and Bangladesh)
    const formattedPhone = formatPhoneNumber(to);
    
    logger.debug('Phone number formatted', {
      original: to,
      formatted: formattedPhone
    });
    
    // Use Messaging Service SID for international SMS (recommended)
    // Falls back to phone number if Messaging Service SID not set
    const messageParams: any = {
      body: message,
      to: formattedPhone,
    };
    
    if (messagingServiceSid) {
      // Use Messaging Service SID - works with international numbers
      messageParams.messagingServiceSid = messagingServiceSid;
      logger.debug('Using Messaging Service SID for SMS', { messagingServiceSid });
    } else if (fromNumber) {
      // Fallback to phone number (US numbers only)
      messageParams.from = fromNumber;
      logger.debug('Using phone number for SMS (fallback - US only)', { fromNumber });
    } else {
      logger.error('TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER must be set');
      return { success: false };
    }
    
    const result = await client.messages.create(messageParams);
    
    // Check if message was created but has error codes (delivery failure)
    const hasError = result.errorCode != null || result.errorMessage;
    
    if (hasError) {
      logger.warn('SMS created but has error codes', {
        sid: result.sid,
        to: formattedPhone,
        status: result.status,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        method: messagingServiceSid ? 'Messaging Service' : 'Phone Number'
      });
      
      return {
        success: false,
        messageSid: result.sid,
        status: result.status,
        ...(result.errorCode != null && { errorCode: result.errorCode }),
        ...(result.errorMessage && { errorMessage: result.errorMessage })
      };
    }
    
    logger.info('SMS sent successfully', {
      sid: result.sid,
      to: formattedPhone,
      status: result.status,
      method: messagingServiceSid ? 'Messaging Service' : 'Phone Number'
    });
    
    return { 
      success: true, 
      messageSid: result.sid,
      status: result.status
    };
  } catch (error: any) {
    const errorData: any = {
      code: error.code,
      status: error.status,
      to,
      messagingServiceSid: messagingServiceSid || 'Not set',
      fromNumber: fromNumber || 'Not set',
    };
    
    // Handle error 21612 - International SMS restriction
    if (error.code === 21612) {
      errorData.note = 'Cannot send SMS from US number to international number. Set TWILIO_MESSAGING_SERVICE_SID to enable international SMS.';
      logger.error('Twilio Error 21612 - International SMS restriction', error, errorData);
    } else if (error.code === 21211) {
      errorData.note = 'Invalid phone number format. USA format: +12086269799 or 2086269799. Bangladesh format: +8801712345678 or 01712345678';
    } else if (error.code === 21608) {
      errorData.note = 'Twilio phone number not verified. Check your Twilio account.';
    } else if (error.code === 20003) {
      errorData.note = 'Invalid credentials. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.';
    }
    
    logger.error('Error sending SMS via Twilio', error, errorData);
    
    return { 
      success: false,
      errorCode: error.code,
      errorMessage: error.message
    };
  }
};

// Check SMS delivery status by message SID
export const checkSMSStatus = async (messageSid: string): Promise<{
  sid: string;
  status: string;
  to: string;
  from: string;
  dateSent: Date | null;
  dateUpdated: Date | null;
  errorCode: number | null;
  errorMessage: string | null;
  price: string | null;
  priceUnit: string | null;
} | null> => {
  try {
    const client = getTwilioClient();
    if (!client) {
      logger.warn('Twilio client not initialized. Cannot check SMS status.');
      return null;
    }
    
    const message = await client.messages(messageSid).fetch();
    
    const statusInfo = {
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      price: message.price,
      priceUnit: message.priceUnit
    };
    
    logger.debug('SMS status checked', statusInfo);
    
    return statusInfo;
  } catch (error: any) {
    logger.error('Error checking SMS status', error, {
      messageSid,
      code: error.code,
      status: error.status
    });
    return null;
  }
};

// Poll SMS delivery status until delivered or failed (with timeout)
export const pollSMSDeliveryStatus = async (
  messageSid: string,
  options: {
    maxAttempts?: number;
    intervalMs?: number;
    timeoutMs?: number;
  } = {}
): Promise<{
  sid: string;
  status: string;
  to: string;
  from: string;
  dateSent: Date | null;
  dateUpdated: Date | null;
  errorCode: number | null;
  errorMessage: string | null;
  price: string | null;
  priceUnit: string | null;
  attempts: number;
  timedOut: boolean;
} | null> => {
  const {
    maxAttempts = 20, // Default: 20 attempts
    intervalMs = 3000, // Default: 3 seconds between checks
    timeoutMs = 60000 // Default: 60 seconds total timeout
  } = options;
  
  const startTime = Date.now();
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // Check timeout
    if (Date.now() - startTime > timeoutMs) {
      logger.warn('SMS status polling timed out', {
        messageSid,
        attempts,
        timeoutMs
      });
      
      // Return last known status
      const lastStatus = await checkSMSStatus(messageSid);
      if (lastStatus) {
        return {
          ...lastStatus,
          attempts,
          timedOut: true
        };
      }
      
      return null;
    }
    
    attempts++;
    const status = await checkSMSStatus(messageSid);
    
    if (!status) {
      logger.warn('Failed to check SMS status', { messageSid, attempts });
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      continue;
    }
    
    // Terminal states - no need to poll further
    const terminalStates = ['delivered', 'failed', 'undelivered'];
    if (terminalStates.includes(status.status.toLowerCase())) {
      logger.info('SMS reached terminal state', {
        messageSid,
        status: status.status,
        attempts
      });
      
      return {
        ...status,
        attempts,
        timedOut: false
      };
    }
    
    // Intermediate states - continue polling
    logger.debug('SMS status polling', {
      messageSid,
      status: status.status,
      attempts,
      maxAttempts
    });
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  // Max attempts reached
  logger.warn('SMS status polling reached max attempts', {
    messageSid,
    attempts: maxAttempts
  });
  
  // Return last known status
  const lastStatus = await checkSMSStatus(messageSid);
  if (lastStatus) {
    return {
      ...lastStatus,
      attempts,
      timedOut: false
    };
  }
  
  return null;
};

// Twilio Verify Service SID
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || 'VAc66c779f03a7c204d05b7a429787deec';

// Send OTP using Twilio Verify API (recommended - more secure)
export const sendOTPCodeViaVerify = async (
  phoneNumber: string,
  templateSid?: string // Optional template SID for custom messages
): Promise<{ success: boolean; sid?: string; error?: string }> => {
  try {
    // Check application-level rate limit BEFORE calling Twilio
    const rateLimitConfig = getOTPRateLimitConfig();
    const rateLimit = checkOTPRateLimit(phoneNumber, rateLimitConfig);

    if (!rateLimit.allowed) {
      const errorMessage = `Too many OTP requests. Please wait ${rateLimit.retryAfter} seconds before requesting again.`;
      logger.warn('OTP rate limit exceeded (application level)', {
        phoneNumber,
        retryAfter: rateLimit.retryAfter,
        maxAttempts: rateLimitConfig.maxAttempts,
        windowMs: rateLimitConfig.windowMs,
      });
      return { success: false, error: errorMessage };
    }

    const client = getTwilioClient();
    if (!client) {
      logger.warn('Twilio client not initialized. OTP not sent.');
      return { success: false, error: 'Twilio client not initialized' };
    }
    
    // Format phone number (supports USA and Bangladesh)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Use Twilio Verify API with optional template
    const verificationParams: any = {
      to: formattedPhone,
      channel: 'sms'
    };
    
    // Add template if provided (for custom message templates)
    if (templateSid) {
      verificationParams.templateSid = templateSid;
    }
    
    const verification = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications
      .create(verificationParams);
    
    logger.info('OTP sent via Twilio Verify', {
      sid: verification.sid,
      to: formattedPhone,
      status: verification.status,
      templateSid: templateSid || 'default'
    });
    
    return { success: true, sid: verification.sid };
  } catch (error: any) {
    const errorData: any = {
      code: error.code,
      status: error.status,
      to: phoneNumber,
    };
    
    // Provide helpful error messages for common Twilio errors
    let userFriendlyError = error.message;
    
    if (error.code === 60200) {
      errorData.note = 'Invalid phone number. Please use a valid phone number with country code.';
      userFriendlyError = 'Invalid phone number format. Please check and try again.';
    } else if (error.code === 60203) {
      // Max send attempts reached (rate limit)
      errorData.note = 'Maximum OTP send attempts reached. Please wait before requesting a new OTP.';
      userFriendlyError = 'Too many OTP requests. Please wait a few minutes before trying again.';
    } else if (error.code === 60410) {
      // Phone number blocked due to fraudulent activity
      errorData.note = 'Phone number temporarily blocked by Twilio. Contact support if this is a legitimate number.';
      userFriendlyError = 'Unable to send OTP to this number. Please contact support or try again later.';
    } else if (error.code === 20429) {
      errorData.note = 'Too many requests. Please wait a moment and try again.';
      userFriendlyError = 'Too many requests. Please wait a moment and try again.';
    } else if (error.status === 429) {
      errorData.note = 'Rate limit exceeded. Please wait before trying again.';
      userFriendlyError = 'Too many requests. Please wait a few minutes before trying again.';
    } else if (error.status === 403) {
      errorData.note = 'Access denied. Phone number may be blocked or restricted.';
      userFriendlyError = 'Unable to send OTP. Please contact support if this persists.';
    }
    
    logger.error('Error sending OTP via Twilio Verify', error, errorData);
    
    return { success: false, error: userFriendlyError };
  }
};

// Verify OTP code using Twilio Verify API
export const verifyOTPCodeViaVerify = async (phoneNumber: string, code: string): Promise<{ success: boolean; valid: boolean; error?: string }> => {
  try {
    const client = getTwilioClient();
    if (!client) {
      logger.warn('Twilio client not initialized. OTP verification failed.');
      return { success: false, valid: false, error: 'Twilio client not initialized' };
    }
    
    // Format phone number (supports USA and Bangladesh)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Verify the code
    const verificationCheck = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verificationChecks
      .create({
        to: formattedPhone,
        code: code
      });
    
    const isValid = verificationCheck.status === 'approved';
    
    logger.info('OTP verification result', {
      sid: verificationCheck.sid,
      status: verificationCheck.status,
      valid: isValid
    });
    
    return { success: true, valid: isValid };
  } catch (error: any) {
    const errorCode = error.code;
    const errorStatus = error.status;
    const errorMessage = error.message || 'Unknown error';
    
    // Provide user-friendly error messages based on Twilio error codes
    let userFriendlyError = errorMessage;
    
    // Twilio Verify API specific error codes
    if (errorCode === 20404 || errorMessage.includes('was not found') || errorMessage.includes('VerificationCheck')) {
      // Verification not found - usually means OTP was never sent, expired, or invalid verification
      userFriendlyError = 'OTP expired or invalid. Please request a new OTP code.';
      logger.warn('OTP verification failed - verification not found', {
        phoneNumber,
        errorCode,
        errorMessage,
        note: 'This usually means OTP was never sent, expired, or verification was not created'
      });
    } else if (errorCode === 60202) {
      // Invalid code
      userFriendlyError = 'Invalid OTP code. Please check and try again.';
      logger.warn('OTP verification failed - invalid code', {
        phoneNumber,
        errorCode
      });
    } else if (errorCode === 60203) {
      // Max attempts reached
      userFriendlyError = 'Maximum verification attempts reached. Please request a new OTP code.';
      logger.warn('OTP verification failed - max attempts reached', {
        phoneNumber,
        errorCode
      });
    } else if (errorCode === 20429 || errorStatus === 429) {
      // Rate limit exceeded
      userFriendlyError = 'Too many verification attempts. Please wait a moment before trying again.';
      logger.warn('OTP verification failed - rate limit exceeded', {
        phoneNumber,
        errorCode
      });
    } else if (errorCode === 60200) {
      // Invalid phone number
      userFriendlyError = 'Invalid phone number format. Please check and try again.';
      logger.warn('OTP verification failed - invalid phone number', {
        phoneNumber,
        errorCode
      });
    } else {
      // Generic error - log full details for debugging
      logger.error('Error verifying OTP', error, {
        code: errorCode,
        status: errorStatus,
        message: errorMessage,
        phoneNumber
      });
      userFriendlyError = 'Failed to verify OTP. Please try again or request a new code.';
    }
    
    return { success: false, valid: false, error: userFriendlyError };
  }
};

// Send OTP code via SMS (Better Auth generates the code)
export const sendOTPCode = async (phoneNumber: string, code: string): Promise<boolean> => {
  try {
    // Check application-level rate limit BEFORE sending SMS
    const rateLimitConfig = getOTPRateLimitConfig();
    const rateLimit = checkOTPRateLimit(phoneNumber, rateLimitConfig);

    if (!rateLimit.allowed) {
      const errorMessage = `Too many OTP requests. Please wait ${rateLimit.retryAfter} seconds before requesting again.`;
      logger.warn('OTP rate limit exceeded (application level)', {
        phoneNumber,
        retryAfter: rateLimit.retryAfter,
        maxAttempts: rateLimitConfig.maxAttempts,
        windowMs: rateLimitConfig.windowMs,
      });
      throw new Error(errorMessage);
    }

    // Format phone number to detect country
    const formatted = formatPhoneNumber(phoneNumber);
    const isBangladesh = formatted.startsWith('+880');
    
    // Production-level SMS messages for Contact X
    const message = isBangladesh
      ? `ContactX - আপনার verification code: ${code}\n\nএই code ১০ মিনিটের মধ্যে expire হবে। কাউকে share করবেন না।\n\nContactX by SalonX`
      : `ContactX - Your verification code: ${code}\n\nThis code expires in 10 minutes. Do not share with anyone.\n\nContactX by SalonX`;
    
    const result = await sendSMS(phoneNumber, message);
    
    if (result.success) {
      logger.info('OTP sent successfully via SMS', { 
        phoneNumber, 
        codeLength: code.length,
        messageSid: result.messageSid,
        status: result.status
      });
    } else {
      logger.error('Failed to send OTP via SMS', { phoneNumber });
    }
    
    return result.success;
  } catch (error: any) {
    logger.error('Error in sendOTPCode', error, { phoneNumber });
    throw error; // Re-throw so Better Auth can handle it
  }
};

// Send OTP via WhatsApp using Content Template (Fallback when SMS fails)
export const sendOTPViaWhatsApp = async (
  phoneNumber: string,
  otpCode: string,
  options?: {
    contentSid?: string; // Default: HX229f5a04fd0510ce1b071852155d3e75
    from?: string; // Default: whatsapp:+14155238886
  }
): Promise<{ success: boolean; messageSid?: string; status?: string; errorCode?: number; errorMessage?: string }> => {
  const whatsappFromNumber = options?.from || process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+15558678965';
  const contentSid = options?.contentSid || process.env.TWILIO_WHATSAPP_OTP_CONTENT_SID || 'HX9e03d7b01e72c48bb5c29161d3efc107';

  try {
    const client = getTwilioClient();
    if (!client) {
      logger.warn('Twilio client not initialized. WhatsApp OTP not sent.');
      return { success: false, errorMessage: 'Twilio client not initialized' };
    }
    
    // Format phone number (supports USA and Bangladesh)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Ensure WhatsApp format (whatsapp:+880...)
    const whatsappTo = formattedPhone.startsWith('whatsapp:') 
      ? formattedPhone 
      : `whatsapp:${formattedPhone}`;
    
    logger.info('Sending OTP via WhatsApp', {
      to: whatsappTo,
      contentSid,
      otpCodeLength: otpCode.length
    });
    
    // Prepare message with content template
    const messageParams: any = {
      from: whatsappFromNumber,
      to: whatsappTo,
      contentSid: contentSid,
      contentVariables: JSON.stringify({
        '1': otpCode // OTP code as variable
      })
    };
    
    const result = await client.messages.create(messageParams);
    
    logger.info('OTP sent successfully via WhatsApp', {
      sid: result.sid,
      to: whatsappTo,
      status: result.status,
      contentSid
    });
    
    return {
      success: true,
      messageSid: result.sid,
      status: result.status
    };
  } catch (error: any) {
    logger.error('Error sending OTP via WhatsApp', error, {
      phoneNumber,
      errorCode: error.code,
      errorMessage: error.message
    });
    
    return {
      success: false,
      errorCode: error.code,
      errorMessage: error.message
    };
  }
};


