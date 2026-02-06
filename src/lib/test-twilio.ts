import dotenv from "dotenv";
import path from "path";
import { sendSMS, sendOTPCode, sendOTPCodeViaVerify, verifyOTPCodeViaVerify, getTwilioStatus } from "./twilio";

// Load environment variables
dotenv.config({
  path: path.join(process.cwd(), ".env")
});

async function testTwilio() {
  console.log("🔍 Testing Twilio Configuration...\n");
  
  // Check environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const twilioStatus = getTwilioStatus();
  
  console.log("📋 Environment Variables Check:");
  console.log(`   TWILIO_ACCOUNT_SID: ${accountSid ? '✅ Set' : '❌ Missing'}`);
  console.log(`   TWILIO_AUTH_TOKEN: ${authToken ? '✅ Set' : '❌ Missing'}`);
  console.log(`   TWILIO_PHONE_NUMBER: ${phoneNumber ? `✅ Set (${phoneNumber})` : '❌ Missing'}`);
  console.log(`   TWILIO_VERIFY_SERVICE_SID: ${verifyServiceSid ? `✅ Set (${verifyServiceSid})` : '❌ Missing'}`);
  
  if (!accountSid || !authToken || !phoneNumber) {
    console.log("\n❌ Twilio environment variables are missing!");
    console.log("Please set the following in your .env file:");
    console.log("   TWILIO_ACCOUNT_SID=your_account_sid");
    console.log("   TWILIO_AUTH_TOKEN=your_auth_token");
    console.log("   TWILIO_PHONE_NUMBER=your_twilio_phone_number");
    process.exit(1);
  }
  
  console.log("\n🧪 Testing SMS sending...");
  
  // Test with a dummy phone number (replace with your test number)
  const testPhoneNumber = process.env.TEST_PHONE_NUMBER || "+1234567890";
  
  if (testPhoneNumber === "+1234567890") {
    console.log("⚠️  Using dummy phone number. Set TEST_PHONE_NUMBER in .env to test actual SMS sending.");
    console.log("   Example: TEST_PHONE_NUMBER=+12086269799");
    console.log("   Note: Use a real, verified phone number for testing.");
    console.log("   Skipping SMS test with dummy number...\n");
  } else {
    try {
      const result = await sendSMS(testPhoneNumber, "Test message from ContactX server");
      
      if (result) {
        console.log("✅ SMS sent successfully!");
      } else {
        console.log("❌ SMS sending failed. Check the error messages above.");
      }
    } catch (error) {
      console.error("❌ Error during test:", error);
    }
  }
  
  console.log("\n🧪 Testing OTP sending...");
  
  if (testPhoneNumber === "+1234567890") {
    console.log("⚠️  Skipping OTP test with dummy number.");
    console.log("   Set TEST_PHONE_NUMBER in .env with a real phone number to test.");
  } else {
    try {
      const otpResult = await sendOTPCode(testPhoneNumber, "123456");
      
      if (otpResult) {
        console.log("✅ OTP sent successfully!");
      } else {
        console.log("❌ OTP sending failed. Check the error messages above.");
      }
    } catch (error) {
      console.error("❌ Error during OTP test:", error);
    }
  }
  
  // Test Twilio Verify API if configured
  if (verifyServiceSid) {
    console.log("\n🧪 Testing Twilio Verify API...");
    
    if (testPhoneNumber === "+1234567890") {
      console.log("⚠️  Cannot test with dummy phone number.");
      console.log("   Set TEST_PHONE_NUMBER in .env with a real, verified phone number.");
      console.log("   Example: TEST_PHONE_NUMBER=+12086269799");
    } else {
      try {
        console.log("📤 Sending OTP via Twilio Verify API...");
        const verifyResult = await sendOTPCodeViaVerify(testPhoneNumber);
        
        if (verifyResult.success) {
          console.log("✅ OTP sent via Twilio Verify API!");
          console.log("   Verification SID:", verifyResult.sid);
          console.log("\n⏳ Check your phone for the OTP code.");
          console.log("   To verify, run: npm run test:twilio:verify");
          console.log("   Or use the verifyOTPCodeViaVerify function with the code you received.");
        } else {
          console.log("❌ Twilio Verify API failed:", verifyResult.error);
        }
      } catch (error) {
        console.error("❌ Error during Twilio Verify API test:", error);
      }
    }
  } else {
    console.log("\n💡 Tip: Set TWILIO_VERIFY_SERVICE_SID in .env to use Twilio Verify API");
  }
}

testTwilio();
