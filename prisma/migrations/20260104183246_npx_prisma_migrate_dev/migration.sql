/*
  Warnings:

  - Added the required column `phoneNumber` to the `personal_info` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Make existing columns nullable (if they were NOT NULL)
ALTER TABLE "personal_info" 
  ALTER COLUMN "firstName" DROP NOT NULL,
  ALTER COLUMN "lastName" DROP NOT NULL,
  ALTER COLUMN "jobTitle" DROP NOT NULL;

-- Step 2: Add phoneNumber and email columns
-- First add phoneNumber as nullable temporarily
ALTER TABLE "personal_info" ADD COLUMN "phoneNumber" TEXT;

-- Add email as nullable (it's optional in schema)
ALTER TABLE "personal_info" ADD COLUMN "email" TEXT;

-- Step 3: For existing records without phoneNumber, we need to handle them
-- Option: Delete records without phoneNumber (since it's required in schema)
-- Or: Set a temporary default value
-- For now, we'll delete records without phoneNumber since it's required
DELETE FROM "personal_info" WHERE "phoneNumber" IS NULL;

-- Step 4: Now make phoneNumber NOT NULL and add unique constraint
ALTER TABLE "personal_info" 
  ALTER COLUMN "phoneNumber" SET NOT NULL;

-- Step 5: Add other optional fields from schema
ALTER TABLE "personal_info" 
  ADD COLUMN "company" TEXT,
  ADD COLUMN "image" TEXT,
  ADD COLUMN "logo" TEXT,
  ADD COLUMN "note" TEXT,
  ADD COLUMN "banner" TEXT,
  ADD COLUMN "profile_img" TEXT;

-- Step 6: Add unique constraints
CREATE UNIQUE INDEX "personal_info_phoneNumber_key" ON "personal_info"("phoneNumber");
CREATE UNIQUE INDEX "personal_info_email_key" ON "personal_info"("email");
