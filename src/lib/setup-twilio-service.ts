import dotenv from "dotenv";
import path from "path";
import twilio from "twilio";

dotenv.config({
  path: path.join(process.cwd(), ".env")
});

async function setupTwilioVerifyService() {
  console.log("🚀 Setting up Twilio Verify Service for Contact X...\n");

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || 'VAc66c779f03a7c204d05b7a429787deec';

  if (!accountSid || !authToken) {
    console.error("❌ TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required!");
    process.exit(1);
  }

  const client = twilio(accountSid, authToken);

  try {
    // Step 1: List available templates
    console.log("📋 Step 1: Checking available templates...\n");
    const templates = await client.verify.v2.templates.list({ limit: 20 });
    
    console.log("Available Templates:");
    templates.forEach((t) => {
      const enTranslation = t.translations?.en;
      if (enTranslation) {
        console.log(`   SID: ${t.sid}`);
        console.log(`   Name: ${t.friendlyName}`);
        console.log(`   Text: ${enTranslation.text}`);
        console.log(`   Status: ${enTranslation.status}\n`);
      }
    });

    // Step 2: Update Service with production settings
    console.log("📝 Step 2: Updating Verify Service...");
    console.log(`   Service SID: ${serviceSid}\n`);

    // Optional: Set default template (uncomment and use template SID if you want)
    // Recommended template: HJ152393dff43d3a2c1554ab0f28291dbe (includes TTL and security warning)
    const defaultTemplateSid = process.env.TWILIO_VERIFY_TEMPLATE_SID; // Optional: Set in .env
    
    const serviceUpdateParams: any = {
      friendlyName: "ContactX", // Appears in SMS as {{friendly_name}}
      codeLength: 6, // Standard 6-digit code
      doNotShareWarningEnabled: true, // Adds security warning automatically
    };
    
    // Add default template if provided
    if (defaultTemplateSid) {
      serviceUpdateParams.defaultTemplateSid = defaultTemplateSid;
      console.log(`   Using Template SID: ${defaultTemplateSid}\n`);
    }
    
    const service = await client.verify.v2
      .services(serviceSid)
      .update(serviceUpdateParams);

    console.log("✅ Service updated successfully!\n");
    console.log("📋 Production Configuration:");
    console.log(`   Friendly Name: ${service.friendlyName}`);
    console.log(`   Code Length: ${service.codeLength}`);
    console.log(`   Security Warning: ${service.doNotShareWarningEnabled ? 'Enabled ✅' : 'Disabled ❌'}`);
    console.log(`   Service SID: ${service.sid}\n`);

    // Step 3: Show current SMS format
    console.log("📱 Current SMS Message Format:");
    console.log(`   "${service.friendlyName} verification code is: {{code}}"`);
    if (service.doNotShareWarningEnabled) {
      console.log(`   "Don't share this code with anyone; our employees will never ask for the code"\n`);
    }

    // Step 4: Instructions for custom template
    console.log("💡 To use custom template:");
    console.log("   1. Go to Twilio Console → Verify → Services → Templates");
    console.log("   2. Create a new template with your custom message");
    console.log("   3. Copy the Template SID (starts with HJ)");
    console.log("   4. Update service with: defaultTemplateSid: 'HJ...'");
    console.log("   5. Or pass templateSid when creating verification\n");

    console.log("✨ Production configuration complete!");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.code === 20404) {
      console.error("   Service not found. Check TWILIO_VERIFY_SERVICE_SID in .env");
    }
    process.exit(1);
  }
}

setupTwilioVerifyService();
