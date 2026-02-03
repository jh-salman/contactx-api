import twilio from 'twilio';

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio credentials not found. SMS will not be sent.');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// Send SMS via Twilio
export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('⚠️ Twilio client not initialized. SMS not sent.');
      return false;
    }
    
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!fromNumber) {
      console.error('❌ TWILIO_PHONE_NUMBER not set in environment variables');
      return false;
    }
    
    // Format phone number (ensure it starts with +)
    const formattedPhone = to.startsWith('+') ? to : `+${to}`;
    
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
      to,
    });
    return false;
  }
};

// Send OTP code via SMS
export const sendOTPCode = async (phoneNumber: string, code: string): Promise<boolean> => {
  const message = `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`;
  
  return await sendSMS(phoneNumber, message);
};

