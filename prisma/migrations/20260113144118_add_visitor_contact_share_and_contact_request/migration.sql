/*
  Warnings:

  - Added the required column `updatedAt` to the `contacts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "visitor_contact_shares" (
    "id" TEXT NOT NULL,
    "ownerCardId" TEXT NOT NULL,
    "visitorCardId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_owner_approval',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "city" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_contact_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedTo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitor_contact_shares_ownerId_idx" ON "visitor_contact_shares"("ownerId");

-- CreateIndex
CREATE INDEX "visitor_contact_shares_visitorId_idx" ON "visitor_contact_shares"("visitorId");

-- CreateIndex
CREATE INDEX "visitor_contact_shares_ownerCardId_idx" ON "visitor_contact_shares"("ownerCardId");

-- CreateIndex
CREATE INDEX "visitor_contact_shares_visitorCardId_idx" ON "visitor_contact_shares"("visitorCardId");

-- CreateIndex
CREATE INDEX "visitor_contact_shares_status_idx" ON "visitor_contact_shares"("status");

-- CreateIndex
CREATE INDEX "contact_requests_requestedBy_idx" ON "contact_requests"("requestedBy");

-- CreateIndex
CREATE INDEX "contact_requests_requestedTo_idx" ON "contact_requests"("requestedTo");

-- CreateIndex
CREATE INDEX "contact_requests_cardId_idx" ON "contact_requests"("cardId");

-- CreateIndex
CREATE INDEX "contact_requests_status_idx" ON "contact_requests"("status");

-- AddForeignKey
ALTER TABLE "visitor_contact_shares" ADD CONSTRAINT "visitor_contact_shares_ownerCardId_fkey" FOREIGN KEY ("ownerCardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_contact_shares" ADD CONSTRAINT "visitor_contact_shares_visitorCardId_fkey" FOREIGN KEY ("visitorCardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_contact_shares" ADD CONSTRAINT "visitor_contact_shares_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_contact_shares" ADD CONSTRAINT "visitor_contact_shares_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_requestedTo_fkey" FOREIGN KEY ("requestedTo") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
