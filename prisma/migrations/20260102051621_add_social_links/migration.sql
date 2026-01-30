/*
  Warnings:

  - You are about to drop the column `cardNumber` on the `cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cards" DROP COLUMN "cardNumber",
ADD COLUMN     "cardColor" TEXT NOT NULL DEFAULT 'black',
ADD COLUMN     "cardTitle" TEXT NOT NULL DEFAULT 'ConactX',
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "imagesAndLayouts" JSONB,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "profile" TEXT,
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "qrImage" TEXT,
ADD COLUMN     "setting" JSONB;

-- CreateTable
CREATE TABLE "personal_info" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,

    CONSTRAINT "personal_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "links" JSONB[],

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_info_cardId_key" ON "personal_info"("cardId");

-- CreateIndex
CREATE INDEX "personal_info_cardId_idx" ON "personal_info"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "social_links_cardId_key" ON "social_links"("cardId");

-- CreateIndex
CREATE INDEX "social_links_cardId_idx" ON "social_links"("cardId");

-- AddForeignKey
ALTER TABLE "personal_info" ADD CONSTRAINT "personal_info_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
