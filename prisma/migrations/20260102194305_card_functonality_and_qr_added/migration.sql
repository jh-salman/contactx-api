-- CreateTable
CREATE TABLE "card_scans" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "source" TEXT NOT NULL DEFAULT 'qr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_scans_cardId_idx" ON "card_scans"("cardId");

-- AddForeignKey
ALTER TABLE "card_scans" ADD CONSTRAINT "card_scans_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
