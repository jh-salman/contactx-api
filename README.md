# ContactX API Server

## Environment Variables

### Twilio Configuration
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio Phone Number (fallback for US numbers only)
- `TWILIO_MESSAGING_SERVICE_SID` - Your Twilio Messaging Service SID (recommended for international SMS)
- `TWILIO_VERIFY_SERVICE_SID` - Your Twilio Verify Service SID (for Twilio Verify API)

### OTP Rate Limiting (Application Level)
- `OTP_RATE_LIMIT_MAX_ATTEMPTS` - Maximum OTP requests per time window (default: 3)
- `OTP_RATE_LIMIT_WINDOW_SECONDS` - Time window in seconds (default: 60)

**Example:**
```env
OTP_RATE_LIMIT_MAX_ATTEMPTS=3
OTP_RATE_LIMIT_WINDOW_SECONDS=60
```

This means: Maximum 3 OTP requests per 60 seconds per phone number.

## Features
- Application-level rate limiting for OTP requests
- Prevents abuse and reduces Twilio costs
- Configurable via environment variables
