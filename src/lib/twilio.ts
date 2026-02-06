import twilio from 'twilio';

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
    console.warn('⚠️ Twilio credentials not found. SMS will not be sent.');
    console.warn('   Missing:', {
      accountSid: !accountSid ? 'TWILIO_ACCOUNT_SID' : null,
      authToken: !authToken ? 'TWILIO_AUTH_TOKEN' : null,
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
const formatPhoneNumber = (phone: string): string => {
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
export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('⚠️ Twilio client not initialized. SMS not sent.');
      return false;
    }
    
    if (!fromNumber) {
      console.error('❌ TWILIO_PHONE_NUMBER not set in environment variables');
      return false;
    }
    
    // Format phone number (supports USA and Bangladesh)
    const formattedPhone = formatPhoneNumber(to);
    
    console.log('📱 Phone number formatted:', {
      original: to,
      formatted: formattedPhone
    });
    
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    });
    
    console.log('✅ SMS sent successfully:', {
      sid: result.sid,
      to: formattedPhone,
      status: result.status,
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ Error sending SMS via Twilio:', {
      error: error.message,
      code: error.code,
      status: error.status,
      to,
      from: fromNumber || 'Not set',
    });
    
    // Provide helpful error messages for common issues
    if (error.code === 21211) {
      console.error('   💡 Invalid phone number format.');
      console.error('   💡 USA format: +12086269799 or 2086269799');
      console.error('   💡 Bangladesh format: +8801712345678 or 01712345678');
    } else if (error.code === 21608) {
      console.error('   💡 Twilio phone number not verified. Check your Twilio account.');
    } else if (error.code === 20003) {
      console.error('   💡 Invalid credentials. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    }
    
    return false;
  }
};

// Twilio Verify Service SID
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || 'VAc66c779f03a7c204d05b7a429787deec';

// Send OTP using Twilio Verify API (recommended - more secure)
export const sendOTPCodeViaVerify = async (phoneNumber: string): Promise<{ success: boolean; sid?: string; error?: string }> => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('⚠️ Twilio client not initialized. OTP not sent.');
      return { success: false, error: 'Twilio client not initialized' };
    }
    
    // Format phone number (supports USA and Bangladesh)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Use Twilio Verify API
    const verification = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications
      .create({
        to: formattedPhone,
        channel: 'sms'
      });
    
    console.log('✅ OTP sent via Twilio Verify:', {
      sid: verification.sid,
      to: formattedPhone,
      status: verification.status,
    });
    
    return { success: true, sid: verification.sid };
  } catch (error: any) {
    console.error('❌ Error sending OTP via Twilio Verify:', {
      error: error.message,
      code: error.code,
      to: phoneNumber,
    });
    
    // Provide helpful error messages
    if (error.code === 60200) {
      console.error('   💡 Invalid phone number. Please use a valid phone number with country code.');
      console.error('   💡 For testing, use a verified phone number in your Twilio account.');
    } else if (error.code === 20429) {
      console.error('   💡 Too many requests. Please wait a moment and try again.');
    }
    
    return { success: false, error: error.message };
  }
};

// Verify OTP code using Twilio Verify API
export const verifyOTPCodeViaVerify = async (phoneNumber: string, code: string): Promise<{ success: boolean; valid: boolean; error?: string }> => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('⚠️ Twilio client not initialized. OTP verification failed.');
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
    
    console.log('✅ OTP verification result:', {
      sid: verificationCheck.sid,
      status: verificationCheck.status,
      valid: isValid
    });
    
    return { success: true, valid: isValid };
  } catch (error: any) {
    console.error('❌ Error verifying OTP:', {
      error: error.message,
      code: error.code,
    });
    
    return { success: false, valid: false, error: error.message };
  }
};

// Send OTP code via SMS (Better Auth generates the code)
export const sendOTPCode = async (phoneNumber: string, code: string): Promise<boolean> => {
  // Format phone number to detect country
  const formatted = formatPhoneNumber(phoneNumber);
  const isBangladesh = formatted.startsWith('+880');
  
  // Bilingual message support
  const message = isBangladesh
    ? `আপনার verification code: ${code}\n\nএই code ১০ মিনিটের মধ্যে expire হবে।`
    : `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`;
  
  return await sendSMS(phoneNumber, message);
};


