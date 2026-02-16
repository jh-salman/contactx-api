-- AlterTable
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "tags" JSONB;
