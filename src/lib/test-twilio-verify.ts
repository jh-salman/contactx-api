import dotenv from "dotenv";
import path from "path";
import { sendOTPCodeViaVerify, verifyOTPCodeViaVerify, getTwilioStatus } from "./twilio";
import * as readline from "readline";

// Load environment variables
dotenv.config({
  path: path.join(process.cwd(), ".env")
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testTwilioVerify() {
  console.log("🔍 Testing Twilio Verify API...\n");
  
  const twilioStatus = getTwilioStatus();
  
  // Check if Twilio Verify is configured
  if (!twilioStatus.hasVerifyServiceSid) {
    console.log("❌ TWILIO_VERIFY_SERVICE_SID is not set!");
    console.log("Please set TWILIO_VERIFY_SERVICE_SID in your .env file");
    rl.close();
    process.exit(1);
  }
  
  // Get test phone number
  const testPhone = process.env.TEST_PHONE_NUMBER || "+12086269799";
  
  console.log("📋 Configuration:");
  console.log(`   Phone Number: ${testPhone}`);
  console.log(`   Verify Service SID: ${twilioStatus.verifyServiceSid}\n`);
  
  // Step 1: Send OTP
  console.log("📤 Step 1: Sending OTP...");
  const sendResult = await sendOTPCodeViaVerify(testPhone);
  
  if (!sendResult.success) {
    console.log("❌ Failed to send OTP:", sendResult.error);
    rl.close();
    process.exit(1);
  }
  
  console.log("✅ OTP sent successfully!");
  console.log("   Verification SID:", sendResult.sid);
  console.log("\n⏳ Check your phone for the OTP code.\n");
  
  // Step 2: Get OTP code from user
  const otpCode = await askQuestion("Enter the OTP code you received: ");
  
  if (!otpCode || otpCode.trim().length === 0) {
    console.log("❌ No OTP code provided");
    rl.close();
    process.exit(1);
  }
  
  // Step 3: Verify OTP
  console.log("\n🔐 Step 2: Verifying OTP code...");
  const verifyResult = await verifyOTPCodeViaVerify(testPhone, otpCode.trim());
  
  if (verifyResult.success && verifyResult.valid) {
    console.log("✅ OTP verified successfully!");
  } else {
    console.log("❌ OTP verification failed");
    if (verifyResult.error) {
      console.log("   Error:", verifyResult.error);
    } else {
      console.log("   Invalid OTP code. Please try again.");
    }
  }
  
  rl.close();
}

testTwilioVerify().catch((error) => {
  console.error("❌ Error:", error);
  rl.close();
  process.exit(1);
});
